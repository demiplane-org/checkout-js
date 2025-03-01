import { createCheckoutService, createEmbeddedCheckoutMessenger } from '@bigcommerce/checkout-sdk';
import { BrowserOptions } from '@sentry/browser';
import React, { Component } from 'react';
import ReactModal from 'react-modal';

import { AnalyticsProvider } from '@bigcommerce/checkout/analytics';
import { ExtensionProvider } from '@bigcommerce/checkout/checkout-extension';
import { getLanguageService, LocaleProvider } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import '../../scss/App.scss';

import {
    createEmbeddedCheckoutStylesheet,
    createEmbeddedCheckoutSupport,
} from '../embeddedCheckout';

import Checkout from './Checkout';

export interface CheckoutAppProps {
    checkoutId: string;
    containerId: string;
    publicPath?: string;
    sentryConfig?: BrowserOptions;
}

export default class CheckoutApp extends Component<CheckoutAppProps> {
    private checkoutService = createCheckoutService({
        locale: getLanguageService().getLocale(),
        shouldWarnMutation: process.env.NODE_ENV === 'development',
    });
    private embeddedStylesheet = createEmbeddedCheckoutStylesheet();
    private embeddedSupport = createEmbeddedCheckoutSupport(getLanguageService());

    componentDidMount(): void {
        const { containerId } = this.props;

        ReactModal.setAppElement(`#${containerId}`);
    }

    render() {
        return (
            <LocaleProvider checkoutService={this.checkoutService}>
                <CheckoutProvider checkoutService={this.checkoutService}>
                    <AnalyticsProvider checkoutService={this.checkoutService}>
                        <ExtensionProvider checkoutService={this.checkoutService}>
                            <Checkout
                                {...this.props}
                                createEmbeddedMessenger={createEmbeddedCheckoutMessenger}
                                embeddedStylesheet={this.embeddedStylesheet}
                                embeddedSupport={this.embeddedSupport}
                            />
                        </ExtensionProvider>
                    </AnalyticsProvider>
                </CheckoutProvider>
            </LocaleProvider>
        );
    }
}
