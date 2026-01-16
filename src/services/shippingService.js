// SIMULADOR DE ENVÍO (MOCKUP)
// Esto reemplaza a la API de EnvíoPack/Zippin por ahora

export const shippingService = {
  
  // 1. Cotizar envío según CP
  async getOptions(zipCode) {
    // Simulamos que tarda un poquito en pensar (como una API real)
    await new Promise(resolve => setTimeout(resolve, 800));

    const cp = parseInt(zipCode);
    let basePrice = 5500; 

    // Lógica simple: Si es CP alto (>2000), es más lejos y más caro
    if (cp > 2000) basePrice = 6800;
    if (cp > 4000) basePrice = 8500;

    return [
      {
        id: 'correo-arg-clasico',
        provider: 'Correo Argentino',
        name: 'Clásico a Domicilio',
        price: basePrice,
        delivery_days: '3 a 6 días hábiles',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Correo_Argentino_logo.svg/1200px-Correo_Argentino_logo.svg.png' 
      },
      {
        id: 'andreani-estandar',
        provider: 'Andreani',
        name: 'Estándar',
        price: basePrice + 1200, // Un poco más caro
        delivery_days: '2 a 3 días hábiles',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Andreani_logo.png/640px-Andreani_logo.png'
      },
      {
        id: 'correo-arg-sucursal',
        provider: 'Correo Argentino',
        name: 'Retiro en Sucursal',
        price: basePrice - 1000, // Más barato
        delivery_days: '3 a 5 días hábiles'
      }
    ];
  }
};