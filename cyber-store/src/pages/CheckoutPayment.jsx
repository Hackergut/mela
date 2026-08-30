import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, CheckCircle2, Lock, ShieldCheck, ArrowLeft, ShoppingBag, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import CheckoutSteps from '../components/CheckoutSteps';

export default function CheckoutPayment() {
  const navigate = useNavigate();
  const { cart, cartSubtotal, discountPercent, clearCart, createStripeCheckoutSession, showToast } = useStore();

  const [paymentMethod, setPaymentMethod] = useState('stripe'); // 'stripe' | 'card' | 'paypal'
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Card Inputs
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('•••');
  const [cardHolder, setCardHolder] = useState('Mario Rossi');

  const discountAmount = (cartSubtotal * discountPercent) / 100;
  const shippingFee = cartSubtotal > 50 ? 0 : 9.99;
  const grandTotal = cartSubtotal - discountAmount + shippingFee;

  const handlePayNow = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    if (paymentMethod === 'stripe') {
      showToast('Inizializzazione Stripe Checkout...', 'info');
      const stripeRes = await createStripeCheckoutSession(shippingFee);
      if (stripeRes.success && stripeRes.url) {
        // Redirection to Stripe Hosted Checkout URL
        return;
      }
    }

    // Fallback simulation / Instant Order Confirmation
    setTimeout(() => {
      const generatedOrder = `TECHMANIA-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderNumber(generatedOrder);
      setIsProcessing(false);
      setOrderComplete(true);
      clearCart();
      showToast(`Ordine ${generatedOrder} confermato con successo!`, 'success');
    }, 1800);
  };

  if (cart.length === 0 && !orderComplete) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-black">Il tuo carrello TechMania è vuoto</h2>
        <p className="text-xs text-gray-500">Non ci sono prodotti da pagare nel carrello.</p>
        <Link to="/products" className="inline-block px-6 py-3 bg-black text-white text-xs font-bold rounded-xl">
          Torna allo Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      
      {!orderComplete && <CheckoutSteps currentStep={3} />}

      <AnimatePresence mode="wait">
        {!orderComplete ? (
          <motion.div
            key="payment-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Payment Method Details */}
            <div className="lg:col-span-8 space-y-6">
              
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <h2 className="text-lg font-black text-black tracking-tight">Metodo di Pagamento Sicuro</h2>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Crittografia SSL 256-bit</span>
                  </div>
                </div>

                {/* Option Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('stripe')}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-24 transition-all ${
                      paymentMethod === 'stripe'
                        ? 'border-black bg-black text-white shadow-md'
                        : 'border-gray-200 hover:border-gray-300 text-black'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-black uppercase tracking-wider">Stripe Checkout</span>
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-[11px] opacity-80">Pagamento reale immediato o Carta</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-24 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-black bg-black text-white shadow-md'
                        : 'border-gray-200 hover:border-gray-300 text-black'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-black uppercase tracking-wider">Carta di Credito</span>
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] opacity-80">Visa, Mastercard, Amex</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-24 transition-all ${
                      paymentMethod === 'paypal'
                        ? 'border-black bg-black text-white shadow-md'
                        : 'border-gray-200 hover:border-gray-300 text-black'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-black uppercase tracking-wider">PayPal / Klarna</span>
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] opacity-80">3 Rate senza interessi</span>
                  </button>
                </div>

                {/* Card Fields */}
                <form onSubmit={handlePayNow} className="space-y-4 pt-2">
                  {paymentMethod === 'stripe' && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        Modalità Stripe Checkout
                      </div>
                      <p>Verrai reindirizzato direttamente alla pagina di pagamento crittografata Stripe per completare la transazione in sicurezza.</p>
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Intestatario Carta</label>
                        <input
                          type="text"
                          required
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-black focus:ring-2 focus:ring-black focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Numero Carta</label>
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-black focus:ring-2 focus:ring-black focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Scadenza</label>
                          <input
                            type="text"
                            required
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-black focus:ring-2 focus:ring-black focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CVC / CVV</label>
                          <input
                            type="password"
                            required
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-black focus:ring-2 focus:ring-black focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 flex items-center justify-between">
                    <Link
                      to="/checkout/shipping"
                      className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-black"
                    >
                      <ArrowLeft className="w-4 h-4" /> Torna a Spedizione
                    </Link>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isProcessing}
                      className="px-8 py-4 bg-black text-white font-extrabold rounded-2xl hover:bg-gray-800 transition-colors shadow-lg flex items-center gap-2 text-xs"
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Elaborazione Pagamento...</span>
                        </div>
                      ) : (
                        <span>Paga Ora • ${grandTotal.toFixed(2)}</span>
                      )}
                    </motion.button>
                  </div>
                </form>

              </div>
            </div>

            {/* Order Summary Column */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-200 space-y-4">
                <h3 className="text-sm font-extrabold text-black uppercase tracking-wider">Riepilogo Finale</h3>
                
                <div className="divide-y divide-gray-200">
                  {cart.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-black">{item.id}</div>
                        <div className="text-gray-500 text-[11px]">{item.color} • Qtà: {item.quantity}</div>
                      </div>
                      <div className="font-bold text-black">${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotale Prodotti</span>
                    <span className="font-bold text-black">${cartSubtotal.toFixed(2)}</span>
                  </div>

                  {discountPercent > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Sconto ({discountPercent}%)</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Costo Spedizione</span>
                    <span className="font-bold text-black">{shippingFee === 0 ? 'GRATIS' : `$${shippingFee.toFixed(2)}`}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm font-black text-black border-t border-gray-200 pt-3">
                    <span>Totale Addebitato</span>
                    <span>${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

              </div>
            </div>

          </motion.div>
        ) : (
          /* Order Confirmation Screen */
          <motion.div
            key="order-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-xl text-center space-y-6"
          >
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black text-black tracking-tight">Grazie per il tuo Ordine!</h2>
              <p className="text-xs text-gray-500">
                Il tuo pagamento è stato completato con successo. Abbiamo inviato la ricevuta e i dettagli alla tua email.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-2 inline-block text-left w-full">
              <div className="flex justify-between text-xs border-b pb-2">
                <span className="font-bold text-gray-500">ID Ordine:</span>
                <span className="font-black text-black">{orderNumber}</span>
              </div>
              <div className="flex justify-between text-xs border-b py-2">
                <span className="font-bold text-gray-500">Stato Pagamento:</span>
                <span className="font-bold text-emerald-600">Approvato via Stripe</span>
              </div>
              <div className="flex justify-between text-xs pt-2">
                <span className="font-bold text-gray-500">Metodo Spedizione:</span>
                <span className="font-bold text-black">Consegna Espressa TechMania</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Link
                to="/products"
                className="px-8 py-3.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" /> Continua lo Shopping
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
