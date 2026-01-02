const getColorFromUsername = (username) => {
    if (!username) return '#008080'; // Default teal
  
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
  
    const colors = [
      '#008080', // teal
      '#ff69b4', // hot pink
      '#ffa500', // orange
      '#00ffff', // cyan
      '#ffd700', // gold
      '#2e8b57', // seagreen
      '#ff6347', // tomato
      '#9370db', // medium purple
      '#3cb371', // medium sea green
      '#ff8c00', // dark orange
    ];
  
    return colors[Math.abs(hash) % colors.length];
  };
  
  export default getColorFromUsername;
  