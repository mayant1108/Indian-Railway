import crypto from "crypto";
import Razorpay from "razorpay";
import { ApiError } from "../utils/ApiError.js";

let razorpayInstance;

export const isRazorpayConfigured = () =>
  Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

const getRazorpayInstance = () => {
  if (!isRazorpayConfigured()) {
    return null;
  }

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  return razorpayInstance;
};

export const createPaymentOrder = async ({ amount, receipt, notes = {} }) => {
  const razorpay = getRazorpayInstance();

  if (!razorpay) {
    return {
      provider: "dummy",
      amount,
      currency: "INR",
      orderId: `dummy_${Date.now()}`,
      keyId: null,
    };
  }

  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt,
    notes,
  });

  return {
    provider: "razorpay",
    amount: order.amount / 100,
    currency: order.currency,
    orderId: order.id,
    keyId: process.env.RAZORPAY_KEY_ID,
  };
};

export const resolvePaymentDetails = ({
  paymentMethod,
  paymentPayload,
  expectedAmount,
}) => {
  if (paymentMethod !== "razorpay") {
    return {
      provider: "dummy",
      status: "paid",
      amount: expectedAmount,
      orderId: `dummy_${Date.now()}`,
      transactionId: `txn_${Date.now()}`,
      paidAt: new Date(),
    };
  }

  if (!isRazorpayConfigured()) {
    throw new ApiError(
      400,
      "Razorpay is not configured on the server. Use dummy payment or add Razorpay keys."
    );
  }

  const {
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: razorpaySignature,
  } = paymentPayload ?? {};

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new ApiError(400, "Incomplete Razorpay payment payload.");
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    throw new ApiError(400, "Payment verification failed.");
  }

  return {
    provider: "razorpay",
    status: "paid",
    amount: expectedAmount,
    orderId: razorpayOrderId,
    transactionId: razorpayPaymentId,
    paidAt: new Date(),
  };
};
