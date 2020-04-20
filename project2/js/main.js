// Load all parts of the script when the window loads
window.onload = (e) => { 
    loadTrending();
    loadRandom();
    document.querySelector("#searchterm").value = localStorage.getItem(prevSearch);
    document.querySelector("#search").onclick = searchButtonClicked; 
    document.querySelector("#next").onclick = loadNext;
    document.querySelector("#prev").onclick = loadPrev;
    document.querySelector("#rand").onclick = loadRandom;
};

// Initialize necessary global variables
let displayTerm = "";
let page = 0;
let randomOffset = 0;
let prevSearch = "";
let searched = false;
const LIMIT = 5;
const GIPHY_KEY = "4BvFmT5pYuHTD7CPbDNSDL1CZHowPU6b";

// Called whenever the search button is clicked
function searchButtonClicked() {

    // Reset the page number for new searches
    page = 0;

    // Begin building the URL
    const GIPHY_URL = "https://api.giphy.com/v1/gifs/search?";

    
    // Append the api key to the URL
    let url = GIPHY_URL;
    url += "api_key=" + GIPHY_KEY;

    // Parse the user entered term we wish to search
    let term = document.querySelector("#searchterm").value;
    localStorage.setItem(prevSearch, term);
    displayTerm = term;

    // Get rid of any leading and trailing spaces
    term = term.trim();

    // Encode spaces and specials characters
    term = encodeURIComponent(term);

    // If there's no term to search then return
    if (term.length < 1) return;

    // Append the search term to the URL
    url += "&q=" + term;

    // Append the limit to the URL - always 5 
    url += "&limit=" + LIMIT;

    // Append the rating to the URL
    let rating = document.querySelector("#rating").value;
    url += "&rating=" + rating;

    // Update the status to show the current state
    document.querySelector("#status").innerHTML = "<b>Searching for '" + displayTerm + "'</b>";

    // Call the getData() function with the complete URL
    getData(url);


}

function getData(url) {
    // Create a new XHR object
    let xhr = new XMLHttpRequest();

    // Set the onload handler
    xhr.onload = dataLoaded;

    // Set the onerror handler
    xhr.onerror = dataError;

    // Open connection and send the request
    xhr.open("GET", url);
    xhr.send();
}

// Callback Functions
function dataLoaded(e) {
    // Toggle the searched boolean
    searched = true;

    // e.target is the xhr object
    let xhr = e.target;

    // Turn the text into a parsable JavaScript object
    let obj = JSON.parse(xhr.responseText);

    // If there are no results, print a message and return
    if (!obj.data || obj.data.length == 0) {
        document.querySelector("#status").innerHTML = "<b>No results for '" + displayTerm + "'</b>";
        return; //Bail out
    }

    // Start building an HTML string we will display to the user
    let results = obj.data;
    let bigString = "<p id='print'><i>Here are " + results.length + " results for '" + displayTerm + "'</i></p>";

    // Loop through the array of results
    for (let i = 0; i < LIMIT; i++) {
        let result = results[i];

        // Get the URL to the GIF
        let smallURL = result.images.fixed_height_downsampled.url;
        if (!smallURL) smallURL = "images/no-image-found.png";

        // Get the URL to the GIPHY page
        let url = result.url;

        // Build a <div> to hold each result
        let line = `<div class='result'><img src='${smallURL}' title='${result.id}' />`;
        line += `<span><a target='_blank' href='${url}'>View on Giphy</a></span></div>`;

        // Add the <div> to `bigString` and loop
        bigString += line;
    }
    
    // Add the page number to `bigString`
    bigString += `<p id="page">Page number: ${page+1}</p>`;

    // All done building the HTML - show it to the user!
    document.querySelector("#content").innerHTML = bigString;

    // Update the status to show the current state
    document.querySelector("#status").innerHTML = "<b>Success!</b>";
}

function loadNext(e){

    // Restricted from loading next before the original search
    if(!searched) {
        // Update the status to display the current state
        document.querySelector("#status").innerHTML = "<b>No results yet!</b>";
    } else {
        // Increment the page number
        page++;

        // Rebuild the url using the api key
        const GIPHY_URL = "https://api.giphy.com/v1/gifs/search?";
        let url = GIPHY_URL;
        url += "api_key=" + GIPHY_KEY;

        // Grab the search term and encode it to add to the url
        let term = document.querySelector("#searchterm").value;
        displayTerm = term;
        term = term.trim();
        term = encodeURIComponent(term);

        // If there is no term, return. Else add the term to the url
        if (term.length < 1) return;
        url += "&q=" + term;

        // Grab the limit and add it to the url
        url += "&limit=" + (LIMIT);

        // Add the offset to the url - the starting index of objects returned
        url += "&offset=" + (page * LIMIT);

        // Display the search term to the user
        document.querySelector("#status").innerHTML = "<b>Searching for '" + displayTerm + "'</b>";

        // Request data
        getData(url);
    }
}

function loadPrev(e){

    // Restricted from searching for a negative offset
    if(page > 0) {
        // Decrement the page number
        page--;

        // Rebuild the url using the api key
        const GIPHY_URL = "https://api.giphy.com/v1/gifs/search?";
        let url = GIPHY_URL;
        url += "api_key=" + GIPHY_KEY;

        // Grab the search term and encode it to add to the url
        let term = document.querySelector("#searchterm").value;
        displayTerm = term;
        term = term.trim();
        term = encodeURIComponent(term);

        // If there is no term, return. Else add the term to the url
        if (term.length < 1) return;
        url += "&q=" + term;

        // Grab the limit and add it to the url
        url += "&limit=" + (LIMIT);

        // Add the offset to the url - the starting index of objects returned
        url += "&offset=" + (page * LIMIT);

        // Display the search term to the user
        document.querySelector("#status").innerHTML = "<b>Searching for '" + displayTerm + "'</b>";
        // Request data
        getData(url);
    }
    else {
        // Update the status to display the current state
        document.querySelector("#status").innerHTML = "<b>Can't go back any further!</b>";
    }
}

function loadTrending(e) {

    // Rebuild the url using the api key
    const GIPHY_URL = "https://api.giphy.com/v1/gifs/trending?";
    let url = GIPHY_URL;
    url += "api_key=" + GIPHY_KEY;

    // Add the limit to the URL - always 5
    url += "&limit=" + (LIMIT);

    // Request data
    getTrends(url);
}

function getTrends(url) {
    // Create a new XHR object
    let xhr = new XMLHttpRequest();

    // Set the onload handler
    xhr.onload = trendsLoaded;

    // Set the onerror handler
    xhr.onerror = dataError;

    // Open connection and send the request
    xhr.open("GET", url);
    xhr.send();
}

function trendsLoaded(e) {
    // e.target is the xhr object
    let xhr = e.target;

    // Turn the text into a parsable JavaScript object
    let obj = JSON.parse(xhr.responseText);

    // If there are no results, return
    if (!obj.data || obj.data.length == 0) return;

    // Start building an HTML string we will display to the user
    let results = obj.data;
    let bigString = "<ul>";

    // Loop through the array of results
    for (let i = 0; i < LIMIT; i++) {
        let result = results[i];

        // Get the URL to the GIF
        let smallURL = result.images.fixed_width_small.url;
        if (!smallURL) smallURL = "images/no-image-found.png";

        // Get the URL to the GIPHY page
        let url = result.url;

        // Build a <li> to hold each result
        let line = `<li><a target='_blank' href='${url}'>${result.title}</a>`;

        // Add the <li> to `bigString` and loop
        bigString += line;
    }

    // Close the <ul> tag
    bigString += "</ul>";

    // Add the big string to the HTML of #trending
    document.querySelector("#trending").innerHTML += bigString;
}

function loadRandom(e) {

    // Rebuild the url using the api key and limit of 1 gif
    const GIPHY_URL = "https://api.giphy.com/v1/gifs/random?";
    let url = GIPHY_URL;
    url += "api_key=" + GIPHY_KEY + "&limit=1";
    
    // Add the offset to the URL then incremement the offset
    url += "&offset=" + randomOffset;
    randomOffset++;

    // Request data
    getRandom(url);
}

function getRandom(url) {
    // Create a new XHR object
    let xhr = new XMLHttpRequest();

    // Set the onload handler
    xhr.onload = randomLoaded;

    // Set the onerror handler
    xhr.onerror = dataError;

    // Open connection and send the request
    xhr.open("GET", url);
    xhr.send();
}

function randomLoaded(e) {
    // e.target is the xhr object
    let xhr = e.target;

    // Turn the text into a parsable JavaScript object
    let obj = JSON.parse(xhr.responseText);

    // If there are no results, return
    if (!obj.data || obj.data.length == 0) return;

    // Start building an HTML string we will display to the user
    let result = obj.data;
    document.querySelector("#gif").innerHTML = `<img src='${result.images.fixed_height_downsampled.url}' title='${result.id}' />`;
    document.querySelector("#info").innerHTML = `<p>Title: ${result.title}</p><p>Rating: ${result.rating.toUpperCase()}</p>`

    // Add the big string to the HTML of #trending
    //document.querySelector("#random").innerHTML += bigString;
}

function dataError(e) {
    console.log("An error occurred");
}