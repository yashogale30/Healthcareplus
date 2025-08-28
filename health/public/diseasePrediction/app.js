let followups = [];
let answers = {};

async function getFollowups() {
    const problem = document.getElementById("problem").value.trim();
    if (!problem) return alert("Please enter your symptoms.");

    const res = await fetch("http://localhost:5000/api/followups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem })
    });
    const data = await res.json();
    followups = data.followups;

    // Render follow-up questions
    const form = document.getElementById("followupForm");
    form.innerHTML = "";

    // Support both string and object with 'question' property
    followups.forEach((q, i) => {
        const questionText = typeof q === 'string' ? q : q.question || q;
        // Add 'name' attribute needed for FormData collection
        const div = document.createElement("div");
        div.innerHTML = `
            <label for="ans${i}">${questionText}</label>
            <input id="ans${i}" name="ans${i}" />
        `;
        form.appendChild(div);
    });

    // Show step 2
    document.getElementById("step1").style.display = "none";
    document.getElementById("step2").style.display = "block";
}

async function getPrediction() {
    const form = document.getElementById("followupForm");
    const formData = new FormData(form);
    answers = {};

    // Collect all answer values from the form inputs by name
    for (let [key, value] of formData.entries()) {
        answers[key] = value.trim();
    }

    const problem = document.getElementById("problem").value.trim();

    const res = await fetch("http://localhost:5000/api/prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem, answers })
    });

    const data = await res.json();

    // Display results
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = `
        <div class="card"><strong>Possible Conditions:</strong> ${data.conditions.join(", ")}</div>
        <div class="card"><strong>Medicines:</strong> ${data.medicines.join(", ")}</div>
        <div class="card"><strong>Care Tips:</strong> ${data.care_tips.join(", ")}</div>
        <div class="card"><strong>See Doctor If:</strong> ${data.see_doctor_if.join(", ")}</div>
        <div class="card"><strong>Disclaimer:</strong> ${data.disclaimer}</div>
    `;

    document.getElementById("step2").style.display = "none";
    resultsDiv.style.display = "block";
}
