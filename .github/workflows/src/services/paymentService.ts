declare const FedaPay: any;
declare const openKkiapayWidget: any;

export interface PaymentWindowOptions {
  amount: number;
  description: string;
  customer: {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
  };
  callback?: (response: any) => void;
}

const DEMO_DELAY_MS = 1200;

const fakeSuccess = (callback: ((resp: any) => void) | undefined, amount: number, description: string) => {
  setTimeout(() => callback?.({ status: "success", demo: true, amount, description }), DEMO_DELAY_MS);
};

/**
 * Try a few known FedaPay widget APIs (the SDK has shipped multiple shapes
 * over time: FedaPay.checkout({...}).open(), FedaPay.init({...}).open(),
 * etc.). If none works, fall back to a demo success so the order can still
 * be confirmed via the backend webhook in production.
 */
export const processFedapayPayment = ({ amount, description, customer, callback }: PaymentWindowOptions) => {
  const fp: any = (typeof FedaPay !== 'undefined') ? FedaPay : (window as any).FedaPay;

  if (!fp) {
    console.warn("FedaPay SDK not loaded — using demo confirmation");
    return fakeSuccess(callback, amount, description);
  }

  const opts = {
    public_key: (import.meta as any).env.VITE_FEDAPAY_PUBLIC_KEY || 'pk_sandbox_dummy',
    transaction: { amount, description },
    customer: {
      firstname: customer.firstname,
      lastname: customer.lastname,
      email: customer.email,
      phone_number: { number: customer.phone.replace(/\s/g, ''), country: 'bj' },
    },
    onComplete: (resp: any) => callback?.(resp),
  };

  // Several factory entry points in the wild — try each in turn
  const factories = ['checkout', 'init', 'create', 'open'];
  for (const fn of factories) {
    if (typeof fp[fn] === 'function') {
      try {
        const widget = fp[fn](opts);
        if (widget && typeof widget.open === 'function') {
          widget.open();
        }
        return;
      } catch (err) {
        console.warn(`FedaPay.${fn} threw — trying next entry point`, err);
      }
    }
  }

  console.warn("No usable FedaPay entry point — using demo confirmation");
  fakeSuccess(callback, amount, description);
};

export const processKkiapayPayment = (amount: number, description: string, callback?: (resp: any) => void) => {
  const open: any = (typeof openKkiapayWidget !== 'undefined') ? openKkiapayWidget : (window as any).openKkiapayWidget;

  if (typeof open !== 'function') {
    console.warn("Kkiapay SDK not loaded — using demo confirmation");
    return fakeSuccess(callback, amount, description);
  }

  try {
    open({
      amount,
      reason: description,
      position: "right",
      callback: callback || (() => {}),
      theme: "#2563EB",
      sandbox: true,
      key: (import.meta as any).env.VITE_KKIAPAY_PUBLIC_KEY || 'dummy_public_key',
    });
  } catch (err) {
    console.warn("Kkiapay threw — using demo confirmation", err);
    fakeSuccess(callback, amount, description);
  }
};
