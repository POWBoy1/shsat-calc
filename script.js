const schoolCutoffs = {
  "Stuyvesant": 566,
  "Bronx Science": 521,
  "Brooklyn Tech": 503,
  "Brooklyn Latin": 488,
  "Queens Science @ York": 535,
  "Staten Island Tech": 535,
  "HS Math, Science & Engineering (HSMSE)": 516,
  "HS American Studies (HSAS)": 515,
  "Lehman College HS": 489
};

// Improved nonlinear (upside-down bell) scaling
function scaleScore(raw) {
  if (raw <= 0) return 100;
  if (raw >= 57) return 350;

  // Normalize raw to 0–1 range
  const x = raw / 57;

  // Nonlinear curve (upside-down bell)
  // First questions worth more → flattens → increases again
  // Combines logistic and power curve for smoother scaling
  const curve =
    0.5 * Math.sin((x - 0.5) * Math.PI) + // inverted bell shape
    0.5 * Math.pow(x, 2); // accelerates near top

  // Map to scaled range (100–350)
  const scaled = 100 + curve * 250;

  return Math.round(scaled);
}

function calculateScore() {
  const mathRaw = parseInt(document.getElementById("math").value) || 0;
  const elaRaw = parseInt(document.getElementById("ela").value) || 0;

  if (mathRaw < 0 || mathRaw > 57 || elaRaw < 0 || elaRaw > 57) {
    document.getElementById('result').innerHTML = "Please enter valid numbers!";
    return;
  }

  const mathScaled = scaleScore(mathRaw);
  const elaScaled = scaleScore(elaRaw);
  const scaledScore = mathScaled + elaScaled;
  const totalCorrect = mathRaw + elaRaw;
  const percentage = ((totalCorrect / 114) * 100).toFixed(1);

  // Percentile estimation (rough)
  let percentile = '';
  if (scaledScore >= 650) percentile = "99th percentile+";
  else if (scaledScore >= 600) percentile = "95th–98th percentile";
  else if (scaledScore >= 550) percentile = "85th–94th percentile";
  else if (scaledScore >= 500) percentile = "70th–84th percentile";
  else if (scaledScore >= 450) percentile = "50th–69th percentile";
  else percentile = "Below 50th percentile";

  // School chances
  const schoolResults = Object.keys(schoolCutoffs).map(school => {
    const cutoff = schoolCutoffs[school];
    let chance = 0;
    let discovery = "Not eligible";

    if (scaledScore >= cutoff + 10) chance = 100;
    else if (scaledScore <= cutoff - 10) {
      chance = 0;
      if (scaledScore >= cutoff - 20) discovery = "Possible eligibility";
    } else {
      chance = Math.round(((scaledScore - (cutoff - 10)) / 20) * 100);
    }

    let chanceClass = "red";
    if (chance >= 100) chanceClass = "green";
    else if (chance >= 70) chanceClass = "yellow";
    else if (chance > 0) chanceClass = "orange";

    let discoveryClass = "red";
    if (discovery.includes("Possible")) discoveryClass = "yellow";
    if (discovery.includes("Eligible") || discovery.includes("YES")) discoveryClass = "green";

    return { school, cutoff, chance, discovery, chanceClass, discoveryClass };
  });

  // Color logic
  let scoreClass = scaledScore >= 500 ? "green" : scaledScore >= 300 ? "yellow" : "red";
  let percentClass = percentage >= 85 ? "green" : percentage >= 70 ? "yellow" : percentage >= 41 ? "orange" : "red";

  // Render output
  document.getElementById('result').innerHTML = `
    <p><strong>Total Correct Answers:</strong> ${totalCorrect}/114</p>
    <p><strong>Percentage:</strong> <span class="${percentClass}">${percentage}%</span></p>
    <p><strong>Estimated SHSAT Score:</strong> <span class="${scoreClass}">${scaledScore}</span></p>
    <p><strong>Estimated Percentile:</strong> ${percentile}</p>
    <p><strong>School Chances & Discovery:</strong></p>
    <table>
      <tr><th>School</th><th>Cutoff</th><th>Chance</th><th>Discovery Program</th></tr>
      ${schoolResults.map(s => `
        <tr>
          <td>${s.school}</td>
          <td>${s.cutoff}</td>
          <td class="${s.chanceClass}">${s.chance}%</td>
          <td class="${s.discoveryClass}">${s.discovery}</td>
        </tr>`).join('')}
    </table>
  `;
}
