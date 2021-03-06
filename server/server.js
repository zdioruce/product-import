import "@babel/polyfill";
import dotenv from "dotenv";
import "isomorphic-fetch";
import createShopifyAuth, { verifyRequest } from "@shopify/koa-shopify-auth";
import Shopify, { ApiVersion, DataType } from "@shopify/shopify-api";
import Koa from "koa";
import next from "next";
import Router from "koa-router";
import cors from "@koa/cors"

dotenv.config();
const port = parseInt(process.env.PORT, 10) || 8081;
const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev,
});
const handle = app.getRequestHandler();

var mysql = require('mysql');

var con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD
});

con.connect(function(err) {
  if (err) throw err;
  console.log("DB Connected!");
});

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SCOPES.split(","),
  HOST_NAME: process.env.HOST.replace(/https:\/\/|\/$/g, ""),
  API_VERSION: ApiVersion.April21,
  IS_EMBEDDED_APP: true,
  // This should be replaced with your preferred storage strategy
  SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});

// Storing the currently active shops in memory will force them to re-login when your server restarts. You should
// persist this object in your app.
const ACTIVE_SHOPIFY_SHOPS = {};
let shopifyAccessToken;

app.prepare().then(async () => {
  const server = new Koa();
  const router = new Router();
  server.keys = [Shopify.Context.API_SECRET_KEY];
  server.use(
    createShopifyAuth({
      async afterAuth(ctx) {
        // Access token and shop available in ctx.state.shopify
        const { shop, accessToken, scope } = ctx.state.shopify;
        shopifyAccessToken = accessToken;
        const host = ctx.query.host;
        ACTIVE_SHOPIFY_SHOPS[shop] = scope;

        const response = await Shopify.Webhooks.Registry.register({
          shop,
          accessToken,
          path: "/webhooks",
          topic: "APP_UNINSTALLED",
          webhookHandler: async (topic, shop, body) =>
            delete ACTIVE_SHOPIFY_SHOPS[shop],
        });

        if (!response.success) {
          console.log(
            `Failed to register APP_UNINSTALLED webhook: ${response.result}`
          );
        }

        // Redirect to app with shop parameter upon auth
        ctx.redirect(`/?shop=${shop}&host=${host}`);
      },
    })
  );

  const handleRequest = async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  };

  router.post("/webhooks", async (ctx) => {
    try {
      await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
      console.log(`Webhook processed, returned status code 200`);
    } catch (error) {
      console.log(`Failed to process webhook: ${error}`);
    }
  });

  router.post(
    "/graphql",
    verifyRequest({ returnHeader: true }),
    async (ctx, next) => {
      await Shopify.Utils.graphqlProxy(ctx.req, ctx.res);
    }
  );

  router.get("(/_next/static/.*)", handleRequest); // Static content is clear
  router.get("/_next/webpack-hmr", handleRequest); // Webpack content is clear

  router.get("/api/product", async (ctx) => {    
    const { asin } = ctx.request.query

    try {
      const productApi = await fetch('https://api.keepa.com/product?key=69i9bc60t6ifrbvnmld3gi6nfrjega1l8lqdhib1t45f05cbnm2qibqoogf12sm6&domain=1&asin=' + asin)
      const productApiResponse = await productApi.json()
      const productData = productApiResponse.products[0]

      let variants = []
      let tags = []
      let colors = []
      let size = []
      let images = []

      productData.imagesCSV.split(",").forEach(image => {
        images.push({"src":"https://images-na.ssl-images-amazon.com/images/I/" + image})
      }) 

      productData.categoryTree.forEach(category => {
        if(!tags.includes(category.name))
          tags.push(category.name)
      });

      if(productData.color && !colors.includes(productData.color))
        colors.push(productData.color)

      if(productData.size && !size.includes(productData.size))
        size.push(productData.size)

      if(productData.color && productData.size){
        variants.push(
          {
            "sku": productData.asin,
            "option1": productData.color, 
            "option2": productData.size,
            "barcode": productData.eanList.length > 0 ? productData.eanList[0]: ""
          }
        )  
      }else if(productData.color){
        variants.push(
          {
            "sku": productData.asin,
            "option1": productData.color, 
            "barcode": productData.eanList.length > 0 ? productData.eanList[0]: ""
          }
        )  
      }else {
        variants.push(
          {
            "sku": productData.asin,
            "option1": productData.size,
            "barcode": productData.eanList.length > 0 ? productData.eanList[0]: ""
          }
        )  
      }    

      tags.push(productData.productGroup)
      
      let options = []

      if(colors.length > 0){
        options.push({
          "name": "Color",
          "values": colors
        })
      }
        
      if(size.length > 0){
        options.push({
          "name": "Size",
          "values": size
        })
      }

      // let body = {
      //   "product":
      //   {
      //     "title": productData.title,
      //     "body_html": productData.description,
      //     "vendor": productData.brand,
      //     "product_type": productData.type,
      //     "tags": tags,
      //     "images": images,
      //     "status": "draft",
      //     "options" : options,
      //     "variants": variants
      //   }
      // };
      
      // var sql = "INSERT INTO products (title, tags, brand, description, images, status) VALUES ('"
      // + productData.title
      // + "','" + tags
      // + "','" + productData.brand
      // + "','" + productData.description
      // + "','" + images
      // + "','0')";
      var sql = "INSERT INTO products (title) VALUES ('"
      + productData.title + "')";
      console.log("sql =", sql)
      if(con) {
        // con.query(sql, function (err, result) {
        //   //if (err) throw err;
        //   console.log("err =", err);
        //   console.log("result =", result);
        // });  

        ctx.body = JSON.stringify({
          status: 1
        });
      } else {
        ctx.body = JSON.stringify({
          status: 0
        });
      }

      // const apiResponse = await fetch(
      //   `https://${process.env.SHOP}/admin/api/2021-04/products.json`,
      //   {
      //     method: 'post',
      //     headers: {
      //       "X-Shopify-Access-Token": shopifyAccessToken,
      //       "Content-Type": "application/json"
      //     },
      //     body: JSON.stringify(body)
      //   }
      // );
      // const { product } = await apiResponse.json();

      
      ctx.res.statusCode = 200;
    } catch (err) {
      console.error(err);
      ctx.res.statusCode = 500;
    }
  });

  router.get("(.*)", async (ctx) => {
    const shop = ctx.query.shop;

    // This shop hasn't been seen yet, go through OAuth to create a session
    if (ACTIVE_SHOPIFY_SHOPS[shop] === undefined) {
      ctx.redirect(`/auth?shop=${shop}`);
    } else {
      await handleRequest(ctx);
    }
  });

  server.use(cors());
  server.use(router.allowedMethods());
  server.use(router.routes());
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
