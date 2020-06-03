var TEAM_HISTORY_MAP = {
	"DOR": "DH",
	"MOR": "LJ",
	"BYE": null,
};

var TEAM_DATA = {};

function createWinnerGrid(){
	let teams = Object.keys(TEAM_INFO);
	let table = document.getElementById("gridData");
	let teamsSorted = [];
	for (let i = 0; i < teams.length; i++) {
		let teamRaw = TEAM_INFO[teams[i]];
		let teamDataRaw = TEAM_DATA[teams[i]];
		
		if (TEAM_HISTORY_MAP.hasOwnProperty(teams[i])){
			continue;
		}
		
		if (!teamDataRaw) {
			teamDataRaw = {
				wins: 0,
				activeWins: 0,
				reign: 0,
				losses: 0,
				activeReign: 0,
				history: {},
				week: 0,
				year: 0,
			};
		}
		
		teamsSorted.push({team: teamRaw, teamData: teamDataRaw});
	}
	
	teamsSorted = teamsSorted.sort(function(a,b){
		if (a.teamData.wins === b.teamData.wins)
		{
			if (a.teamData.year === b.teamData.year){
				return b.teamData.week - a.teamData.week;
			}
			
			return b.teamData.year - a.teamData.year;
		}
		
		return b.teamData.wins - a.teamData.wins;
	});
	
	for (let j = 0; j < teamsSorted.length; j++) {
		let team = teamsSorted[j].team;
		let teamData = teamsSorted[j].teamData;
		
		let row = document.createElement("TR");
		row.className = "u-textAlign--center"
		let name = document.createElement("TD");
		name.innerHTML = team.name;
		name.className = team.abbr;
		
		row.appendChild(name);
		
		let weeks = document.createElement("TD");
		weeks.innerHTML = teamData.wins;
		row.appendChild(weeks);
		
		let act = document.createElement("TD");
		act.innerHTML = teamData.activeWins;
		row.appendChild(act);
		
		let loss = document.createElement("TD");
		loss.innerHTML = teamData.losses;
		row.appendChild(loss);
		
		let reign = document.createElement("TD");
		reign.innerHTML = teamData.reign;
		row.appendChild(reign);
		
		let year = document.createElement("TD");
		year.innerHTML = (teamData.year > 0) ? ("Week " + teamData.week + ", " + teamData.year) : "---";
		row.appendChild(year);
		
		table.appendChild(row);
	}
	
	
}

function parseData(){
	let history = DATA.history;
	let years = Object.keys(history);
	let table = document.getElementById("historyGrid");
	
	let currReign = "";
	let reignLength = 0;
	let winData = null;
	for (var i = 0; i < years.length; i++){
		let yearData = history[years[i]];
		
		let tableRow = document.createElement("TR");
		
		
		let yearElement = document.createElement("TD");
		yearElement.innerHTML = years[i];
		yearElement.className = "yearIdx season-week"
		
		tableRow.appendChild(yearElement);
		
		for (var j = 0; j < yearData.length; j++) {
			let weekData = yearData[j];
			let winner = historyCheck(weekData.winner);
			let loser = historyCheck(weekData.loser);				
			initializeData(winner);
			initializeData(loser);
									
			let isBye = loser === "BYE";			
			winData = TEAM_DATA[winner];
			
			if (currReign !== winner){
				currReign = winner;
				reignLength = 1;
			}
			else {
				reignLength++;
			}
			
			if (reignLength > winData.reign){
				winData.reign = reignLength;
			}
			
			
			winData.wins++;
			!isBye && winData.activeWins++;
			
			if (years[i] >= winData.year){
				winData.year = years[i];
				winData.week = j+1;			
			} else if (j+1 > winData.week){
				winData.week = j+1;
			}
			
			
			
			let winnerMeta = TEAM_INFO[weekData.winner];
			let dataElement = document.createElement("TD");
			dataElement.innerHTML = winnerMeta.abbr;
			dataElement.className = "winnercell season-week " + winnerMeta.abbr + (isBye ? " bye" : "");
			tableRow.appendChild(dataElement);
			
			if (!isBye){
				let winHistory = winData.history[loser];
				winData.history[loser] = {
					week: j + 1,
					year: years[i],
					winner: true,
					wins: (winHistory ? winHistory.wins++ : 1),
					losses: (winHistory ? winHistory.losses : 0)
				}
				
				
				let lossData = TEAM_DATA[loser];
				lossData.losses++;
				let lossHistory = lossData.history[winner];
				lossData.history[winner] = {
					week: j + 1,
					year: years[i],
					winner: false,
					wins: (lossHistory ? lossHistory.wins : 0),
					losses: (lossHistory ? lossHistory.losses++ : 1)
				}
			}
		}
		
		table.appendChild(tableRow);
	}
	
	winData.activeReign = reignLength;
}


function setupCurrent() {
	let currMatchup = DATA.current;
	let title = document.getElementById("weekTitle");
	title.innerText = "Week " + currMatchup.week + ", " + currMatchup.year;
	
	let champName = document.getElementById("champName");
	let champIcon = document.getElementById("champLogo");
	
	let chalName = document.getElementById("competitorName");
	let chalIcon = document.getElementById("competitorLogo");
	
	let champTeam = TEAM_INFO[currMatchup.champ];
	let chalTeam = TEAM_INFO[currMatchup.chal];

	let isBye = currMatchup.chal === "BYE";
	
	chalName.innerText = chalTeam.name + " (" + chalTeam.currName + ")";
	champName.innerText = champTeam.name + " (" + champTeam.currName + ")";
	
	chalIcon.className = chalIcon.className + " " + chalTeam.abbr;
	chalIcon.innerText = chalTeam.abbr;
	
	champIcon.className = champIcon.className + " " + champTeam.abbr;
	champIcon.innerText = champTeam.abbr;
	
	let blurb = document.getElementById("blurb");
	let blurbText = "";
	
	let champData = TEAM_DATA[currMatchup.champ];
	

	if (!isBye) {
		blurbText += "<p>This week, " + champTeam.name + "'s " + champTeam.currName + " fight to maintain their " + champData.activeReign + " week reign against " + chalTeam.name + "'s " + chalTeam.currName + ".</p>";
	
	
		let matchupHistory = champData.history[currMatchup.chal];
		if (matchupHistory) {
			blurbText += "<p>" + champTeam.name + " currently has a record of " + matchupHistory.wins + "-" + matchupHistory.losses + " against " + chalTeam.name + " in title belt matches.</p>"; 
			
			blurbText += "<p>They most recently faced off in week " + matchupHistory.week + " of the " + matchupHistory.year + " season, where " + (matchupHistory.winner ? champTeam.name : chalTeam.name) + " was victorious.";
		}
		else {
			blurbText += "<p>These two teams have never before faced in a title belt matchup.</p>"
		}
		
	}
	
	if (currMatchup.flair) {
		blurbText += "<p>" + currMatchup.flair + "</p>";
	}

	blurb.innerHTML = blurbText;
}

function historyCheck(key){
	if (TEAM_HISTORY_MAP.hasOwnProperty(key)){
		return TEAM_HISTORY_MAP[key];
	}
	
	return key;
}

function initializeData(team_key){
	if (TEAM_DATA.hasOwnProperty(team_key) || team_key == "BYE"){
		return;
	}
	
	TEAM_DATA[team_key] = {
		wins: 0,
		activeWins: 0,
		reign: 0,
		losses: 0,
		activeReign: 0,
		history: {},
		week: 0,
		year: 0,
	}
}

window.onload = function() {
	parseData();
	setupCurrent();
	createWinnerGrid();
}