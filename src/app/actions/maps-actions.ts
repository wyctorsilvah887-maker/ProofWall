'use server';

/**
 * @fileOverview Server Actions para integração com Google Maps API.
 * As variáveis de ambiente (GOOGLE_MAPS_API_KEY) devem ser configuradas 
 * diretamente no painel da hospedagem (ex: Vercel/Firebase) para segurança.
 */

export async function searchGooglePlaces(query: string, city: string, state: string) {
  // Acesso direto à variável de ambiente do servidor
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.warn("Atenção: GOOGLE_MAPS_API_KEY não encontrada no servidor. Usando modo de simulação.");
    // Simulação para desenvolvimento sem chave
    return [
      { 
        name: `${query}`, 
        address: `Endereço Simulado em ${city}, ${state}`, 
        place_id: "ChIJN1t_tDeuEmsRUsoyG83frY4",
        isMock: true 
      },
      { 
        name: `${query} Filial`, 
        address: `Outro ponto em ${city}`, 
        place_id: "ChIJ2eUgeClu5ZQR9s2L9R6nU0Y",
        isMock: true 
      }
    ];
  }

  try {
    const fullQuery = `${query} em ${city} ${state}`;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(fullQuery)}&key=${apiKey}&language=pt-BR`;

    const res = await fetch(url, { next: { revalidate: 3600 } }); // Cache de 1 hora para economizar API
    const data = await res.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google API Error: ${data.status}`);
    }

    return (data.results || []).map((p: any) => ({
      name: p.name,
      address: p.formatted_address,
      place_id: p.place_id,
      isMock: false
    }));
  } catch (err) {
    console.error("Falha crítica na busca do Google Places:", err);
    return [];
  }
}
