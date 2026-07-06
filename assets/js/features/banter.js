function leaderChangeBanter(currentLeader) {
  if (!currentLeader) return "";

  const leaderKey = "walfordLastLeader";
  const banterKey = "walfordLastLeaderBanter";

  let previousLeader = "";
  let previousBanter = "";

  try {
    previousLeader = localStorage.getItem(leaderKey) || "";
    previousBanter = localStorage.getItem(banterKey) || "";

    if (!previousLeader) {
      localStorage.setItem(leaderKey, currentLeader);
      return previousBanter;
    }

    if (previousLeader === currentLeader) {
      return previousBanter;
    }

    const oldName = leaderDisplayName(previousLeader);
    const newName = leaderDisplayName(currentLeader);

    const lines = [
      `${oldName} has lost the 👑 All hail ${newName} 🙇`,
      `${oldName} has been knocked off the throne 👑 ${newName} takes command.`,
      `Breaking news: ${oldName}'s reign is over. ${newName} is now top dog.`,
      `${newName} has stolen the crown from ${oldName}. Family WhatsApp will be unbearable.`,
      `${oldName} slips. ${newName} rises. The syndicate has a new ruler.`
    ];

    const newBanter = lines[Math.floor(Math.random() * lines.length)];

    localStorage.setItem(leaderKey, currentLeader);
    localStorage.setItem(banterKey, newBanter);

    return newBanter;
  } catch (error) {
    console.warn("Leader change banter storage unavailable.", error);
    return "";
  }
}