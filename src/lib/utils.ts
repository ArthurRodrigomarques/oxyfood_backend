export function isRestaurantOpen(openingHours: any[]) {
  // 1. Pega a data atual
  const now = new Date();

  // 2. Converte explicitamente para o fuso de São Paulo
  // Isso cria uma string com a data/hora correta do Brasil
  const brazilTimeStr = now.toLocaleString("en-US", {
    timeZone: "America/Sao_Paulo",
  });

  // 3. Cria um novo objeto Date baseado nessa string brasileira
  const brazilDate = new Date(brazilTimeStr);

  // 4. Extrai dia e hora CORRETOS
  const currentDay = brazilDate.getDay(); // 0 = Domingo, 1 = Segunda...
  const currentHour = brazilDate.getHours();
  const currentMinute = brazilDate.getMinutes();

  // Converte hora atual para minutos totais (ex: 18:30 = 1110 minutos)
  const currentTotalMinutes = currentHour * 60 + currentMinute;

  // 5. Procura se tem horário configurado para hoje
  const todaySchedule = openingHours.find((s) => s.dayOfWeek === currentDay);

  if (!todaySchedule) return false; // Fechado hoje

  // 6. Converte horário de abrir/fechar do banco para minutos
  // Formato esperado do banco: "18:00" e "23:00"
  const [openH, openM] = todaySchedule.openTime.split(":").map(Number);
  const [closeH, closeM] = todaySchedule.closeTime.split(":").map(Number);

  const openTotalMinutes = openH * 60 + openM;
  const closeTotalMinutes = closeH * 60 + closeM;

  // 7. Verifica se está dentro do intervalo
  // Lida com fechamento após meia-noite (ex: abre 18:00, fecha 02:00)
  if (closeTotalMinutes < openTotalMinutes) {
    // Caso especial: Fecha no dia seguinte (madrugada)
    return (
      currentTotalMinutes >= openTotalMinutes ||
      currentTotalMinutes < closeTotalMinutes
    );
  } else {
    // Caso normal: Abre e fecha no mesmo dia
    return (
      currentTotalMinutes >= openTotalMinutes &&
      currentTotalMinutes < closeTotalMinutes
    );
  }
}
