document.addEventListener("DOMContentLoaded", () => {
  const candidates = [
    { name: "Devendra Fadnavis", party: "BJP", symbol: "Lotus" },
    { name: "Uddhav Thackeray", party: "Shiv Sena (UBT)", symbol: "Mashal" },
    { name: "Ajit Pawar", party: "NCP (Ajit Pawar)", symbol: "Clock" },
    { name: "Supriya Sule", party: "NCP (Sharad Pawar)", symbol: "Trumpet" },
    { name: "Prithviraj Chavan", party: "Congress", symbol: "Hand" }
  ];

  const candidateListEl = document.getElementById("candidateList");
  const candidateSelectEl = document.getElementById("candidateSelect");
  const voteFormEl = document.getElementById("voteForm");
  const messageEl = document.getElementById("message");

  const votingSection = document.querySelector(".voting-section");
  const voteActionSection = document.querySelector(".vote-action");

  function renderCandidateList() {
    candidateListEl.innerHTML = "";
    candidates.forEach(candidate => {
      const li = document.createElement("li");
      li.innerHTML = `${candidate.name} (${candidate.party}) - <strong>${candidate.symbol}</strong>`;
      candidateListEl.appendChild(li);
    });
  }

  function renderCandidateSelect() {
    candidateSelectEl.innerHTML = `<option value="" disabled selected>Select candidate</option>`;
    candidates.forEach(candidate => {
      const option = document.createElement("option");
      option.value = candidate.name;
      option.textContent = `${candidate.name} (${candidate.party})`;
      candidateSelectEl.appendChild(option);
    });
  }

  function showCandidateListView() {
    votingSection.style.display = "block";
    voteActionSection.style.display = "none";
    messageEl.textContent = "";
  }

  function showVoteView() {
    votingSection.style.display = "none";
    voteActionSection.style.display = "block";
    messageEl.textContent = "";
  }

  function router() {
    const path = window.location.pathname;
    if (path === "/vote") {
      showVoteView();
    } else {
      showCandidateListView();
    }
  }

  document.body.addEventListener("click", e => {
    if (e.target.matches("[data-link]")) {
      e.preventDefault();
      const href = e.target.getAttribute("href");
      window.history.pushState(null, null, href);
      router();
    }
  });

  window.addEventListener("popstate", router);

  // ✅ REAL Vote Submission
  voteFormEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    const selectedCandidate = candidateSelectEl.value;

    if (!selectedCandidate) {
      messageEl.textContent = "Please select a candidate before voting.";
      messageEl.style.color = "red";
      return;
    }

    try {
      const response = await fetch("/submit-vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ candidate: selectedCandidate })
      });

      const result = await response.json();

      messageEl.textContent = result.message;
      messageEl.style.color = result.success ? "green" : "red";

      if (result.success) voteFormEl.reset();

    } catch (error) {
      messageEl.textContent = "An error occurred while submitting your vote.";
      messageEl.style.color = "red";
    }
  });





  renderCandidateList();
  renderCandidateSelect();
  router();

});



// static/logout.js

document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      fetch('/logout', {
        method: 'POST'
      })
      .then(() => {
        // Manually redirect after logout
        window.location.href = '/';
      })
      .catch(error => {
        console.error('Logout failed:', error);
      });
    });
  }
});

