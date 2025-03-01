import { CheckoutSelectors, CustomError } from '@bigcommerce/checkout-sdk';
import { createSelector } from 'reselect';

import { CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';

import { EMPTY_ARRAY } from '../common/utility';

import { WithCheckoutProps } from './Checkout';
import getCheckoutStepStatuses from './getCheckoutStepStatuses';

export default function mapToCheckoutProps({
    checkoutService,
    checkoutState,
}: CheckoutContextProps): WithCheckoutProps {
    const { data, errors, statuses } = checkoutState;
    const { promotions = EMPTY_ARRAY } = data.getCheckout() || {};
    const submitOrderError = errors.getSubmitOrderError() as CustomError;
    const {
        checkoutSettings: {
            guestCheckoutEnabled: isGuestEnabled = false,
            features = {},
            checkoutUserExperienceSettings = {
                walletButtonsOnTop: false,
                floatingLabelEnabled: false,
            } ,
        } = {},
        links: {
            loginLink: loginUrl = '',
            createAccountLink: createAccountUrl = '',
            cartLink: cartUrl = '',
        } = {},
        displaySettings: { hidePriceFromGuests: isPriceHiddenFromGuests = false } = {},
    } = data.getConfig() || {};

    const subscribeToConsignmentsSelector = createSelector(
        ({ checkoutService: { subscribe } }: CheckoutContextProps) => subscribe,
        (subscribe) => (subscriber: (state: CheckoutSelectors) => void) => {
            return subscribe(subscriber, ({ data: { getConsignments } }) => getConsignments());
        },
    );

    const walletButtonsOnTopFlag = Boolean(checkoutUserExperienceSettings.walletButtonsOnTop);

    const isSentryLoggingAll =
        features['CHECKOUT-7764.Increase_sentry_logging_to_100_percent'] || false;

    return {
        billingAddress: data.getBillingAddress(),
        cart: data.getCart(),
        clearError: checkoutService.clearError,
        consignments: data.getConsignments(),
        hasCartChanged: submitOrderError && submitOrderError.type === 'cart_changed', // TODO: Need to clear the error once it's displayed
        isGuestEnabled,
        isLoadingCheckout: statuses.isLoadingCheckout(),
        isPending: statuses.isPending(),
        isPriceHiddenFromGuests,
        isShowingWalletButtonsOnTop: walletButtonsOnTopFlag,
        isSentryLoggingAll,
        loadCheckout: checkoutService.loadCheckout,
        loginUrl,
        cartUrl,
        createAccountUrl,
        promotions,
        subscribeToConsignments: subscribeToConsignmentsSelector({
            checkoutService,
            checkoutState,
        }),
        steps: data.getCheckout() ? getCheckoutStepStatuses(checkoutState) : EMPTY_ARRAY,
    };
}
