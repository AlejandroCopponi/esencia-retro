// SIMULADOR DE PAGO (MOCKUP)

export const paymentService = {
  
  async createPreference(orderData) {
    console.log("💰 Generando link de pago para:", orderData.total);
    
    // Devolvemos un ID falso de Mercado Pago
    return {
      id: "MOCK_PREF_" + Date.now(),
      init_point: "#" // En el futuro, acá va el link real de MP
    };
  }
};