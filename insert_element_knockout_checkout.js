require(['jquery', 'knockout'], function($, ko) {
    // Define your ViewModel
    function CheckoutViewModel() {
        var self = this;

        self.subtotal = ko.observable(0);
        self.total = ko.observable(0);

        // Function to update totals
        self.updateTotals = function() {
            self.subtotal(window.MaxServCheckoutConfig.baseData.ecommerce.checkout.sub_total);
            self.total(window.MaxServCheckoutConfig.baseData.ecommerce.value);
        };

        // Function to inject HTML
        self.injectTotalsHtml = function() {
            if ($('.checkout-info').length === 0) {
                var htmlContent = `
                    <div class='checkout-info'>
                        <div class='info-row'>
                            <div class='label'><strong>Subtotaal</strong> excl. BTW:</div>
                            <div class='value'>€ ${self.subtotal()}</div>
                        </div>
                        <div class='info-row'>
                            <div class='label'><strong>Totaal</strong> incl. BTW:</div>
                            <div class='value'>€ ${self.total()}</div>
                        </div>
                    </div>
                `;
                const myAgreement = $('[data-role^="checkout-agreements"]');
                $(htmlContent).insertBefore(myAgreement);
            }
        };
    }

    // Create an instance of the ViewModel
    var viewModel = new CheckoutViewModel();

    // Update and inject totals
    $(document).ready(function() {
    var checkExist = setInterval(function() {
        if ($('[data-role^="checkout-agreements"]').length) {
            clearInterval(checkExist);
            viewModel.updateTotals();
            viewModel.injectTotalsHtml();
        }
    }, 100); // Check every 100 milliseconds
});
});
