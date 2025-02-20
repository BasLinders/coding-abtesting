// Sometimes, a single page type can work with different styles. To prevent an A/B test with general stylesheets to alter a page that should not be altered, you can inject the stylesheets through javascript.

function injectStyles() {
      const priceTable = document.querySelector('.product-block-prices');
      if (!priceTable) return; // Selector and condition for injecting
      
      const style = document.createElement('style');
      style.textContent = `
          .product-detail-buy .product-price-container {
              flex-direction: column;
              align-items: flex-start;
              margin-bottom: 18px !important;
              display: inline-flex;
              font-family: "Jost", sans-serif;
          }
          .product-main-price-wrapper {
              display: flex;
              flex-direction: row;
              align-items: baseline;
              gap: 4px;
          }
          .product-main-price-wrapper .product-price-currency {
              font-size: 16px;
              align-self: flex-start;
              margin-right: 0 !important;
          }
          .product-main-price-wrapper .product-price-amount {
              font-size: 40px;
              font-weight: 500;
              line-height: 1;
          }
          .product-main-price-wrapper .product-price-cents {
              font-size: 16px;
              align-self: flex-start;
              position: relative;
              margin-left: -8px !important;
          }
          .product-old-price {
              font-size: 1rem;
              color: #999;
              text-decoration: line-through;
              margin-bottom: 5px;
          }
          .list-price-value {
              color: #999;
          }
          tr.product-block-prices-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              width: 100%;
          }
          td.product-block-prices-cell {
              display: flex;
              align-items: center;
              gap: 12px;
              flex: 1;
              justify-content: flex-start;
              min-width: 0;
          }
          th.product-block-prices-cell {
              flex: 1;
              text-align: left;
              white-space: nowrap;
          }
          .product-detail-list-price-wrapper {
              display: flex;
              align-items: center;
              justify-content: flex-start;
              gap: 4px;
              min-width: 110px;
          }
          .product-current-price {
              font-size: 1rem;
              font-weight: bold;
              white-space: nowrap;
              color: #194c58;
          }
          .list-price-price {
              text-decoration: line-through;
              color: #999;
              font-size: 0.875rem;
              display: inline-block;
              white-space: nowrap;
          }
          .savingslabel {
              color: #e52427;
              font-weight: bold;
              align-self: center;
              flex-shrink: 0;
          }
          .product-block-prices-cell.savings {
              color: #e52427 !important;
              font-weight: bold;
              text-align: right;
              justify-content: flex-end;
          }
          .product-block-prices-cell.savings-header {
              color: #e52427 !important;
              text-align: right;
          }
          tr.product-block-prices-row td {
              min-height: 40px;
          }
          @media only screen and (max-width: 991px) {
              .product-detail-list-price-wrapper .list-price-price {
                  line-height: 24px;
                  display: inline-block;
              }
              .product-price-amount {
                  font-size: 2.5rem;
              }
              .product-price-cents {
                  font-size: 1.2rem;
              }
              .product-block-prices-cell {
                  gap: 8px;
              }
              .product-detail-list-price-wrapper {
                  min-width: 90px;
              }
          }
      `;
      document.head.appendChild(style); // Append to head element
  }

// Call the function to inject the stylesheets. This can happen under specified conditions to prevent unwanted style changes.
