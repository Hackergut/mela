import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Truck, CreditCard, Check } from 'lucide-react';

export default function CheckoutSteps({ currentStep = 1 }) {
  const steps = [
    { id: 1, name: 'Indirizzo', path: '/checkout/address', icon: MapPin },
    { id: 2, name: 'Spedizione', path: '/checkout/shipping', icon: Truck },
    { id: 3, name: 'Pagamento', path: '/checkout/payment', icon: CreditCard },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto my-8 px-4">
      <div className="relative flex items-center justify-between">
        
        {/* Background Connecting Line */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-gray-200 -z-10 rounded-full" />
        
        {/* Progress Fill Line */}
        <motion.div
          className="absolute top-1/2 left-0 -translate-y-1/2 h-1 bg-black -z-10 rounded-full"
          initial={{ width: '0%' }}
          animate={{
            width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />

        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center bg-white px-2">
              <Link
                to={isCompleted ? step.path : '#'}
                onClick={(e) => {
                  if (!isCompleted && !isActive) e.preventDefault();
                }}
              >
                <motion.div
                  whileHover={isCompleted ? { scale: 1.1 } : {}}
                  whileTap={isCompleted ? { scale: 0.95 } : {}}
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    isCompleted
                      ? 'bg-black text-white shadow-md'
                      : isActive
                      ? 'bg-black text-white ring-4 ring-gray-100 shadow-lg scale-110'
                      : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </motion.div>
              </Link>
              
              <span
                className={`mt-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  isActive || isCompleted ? 'text-black' : 'text-gray-400'
                }`}
              >
                Passo {step.id}: {step.name}
              </span>
            </div>
          );
        })}

      </div>
    </div>
  );
}
