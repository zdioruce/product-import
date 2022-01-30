import styles from './SingleProductModal.module.scss'
import { Modal, TextContainer, TextField } from "@shopify/polaris";

export default function SingleProductModal({open, value, onClose, onChange}) {

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Product"
      primaryAction={{
        content: 'Import',
        onAction: onClose,
      }}
    >
      <Modal.Section>
        <TextContainer>
          <TextField
            label="Product ID"
            value={value}
            onChange={onChange}
            autoComplete="off"
            placeholder="Enter Product ID"
          />
        </TextContainer>
      </Modal.Section>
    </Modal>    
  )
}
