// searchHistory is an Array that stores current and previous searches of cities.
var searchHistory = [];

// This function returns the date in m/dd/yyyy format.
function grabDate(response, index) {
    var milliseconds = response.list[index].dt * 1000;
    var dateObj = new Date(milliseconds);
     return dateObj.toLocaleDateString();
}

// This function empties the whole screen by removing the cards that hold the 
// weather information, and then creating the buttons for any cities previously
// searched for by checking local storage.
function renderPage() {
    $(".card-body").empty();
    for(var i = 0; i < 5; i++) {
        $(".card-body" + i).empty();
    }
    $(".btn-group-vertical").empty();
    searchHistory = JSON.parse(localStorage.getItem("searchHistory"));

    // This condition will run if there is at least one other search term.
    if(searchHistory != null) {
        for(var i = 0; i < searchHistory.length; i++) {
            var cityButton = $("<button>").attr({
                type: "button", 
                class: "btn btn-light btn-lg btn-block",
                id: "cityBtn",
                city: searchHistory[i]});
            cityButton.text(searchHistory[i]);
            $(".btn-group-vertical").prepend(cityButton);
        }
    } else {
        searchHistory = [];
    }
}

// This function grabs the UV index of the city and colors that index in depending
// on its value. It returns the information as an element.
function grabUVData(APIKey, lat, lon) {
    // The query URL of the Open Weather Map for UV Index lookup is implemented here.
    var queryURL = "https://api.openweathermap.org/data/2.5/uvi/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey;
    var UVSet = $("<p>");
    var UVSpan = $("<span>");
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        var UVNum = response[0].value;
        UVSpan.text(UVNum);

        // These statements will determine the color that the number will be enclosed
        // in, according to the EPA.
        if(UVNum >=0 && UVNum <= 2.9) {
          UVSpan.attr("style", "background-color: green;");
        } else if(UVNum >= 3 && UVNum <= 5.9) {
          UVSpan.attr("style", "background-color: yellow;");
        } else if(UVNum >= 6 && UVNum <= 7.9) {
          UVSpan.attr("style", "background-color: orange;");
        } else if(UVNum >= 8 && UVNum <= 10.9) {
          UVSpan.attr("style", "background-color: red; color: white;");
        } else if(UVNum >= 11) {
          UVSpan.attr("style", "background-color: purple; color: white");
        } 
        UVSet.text("UV Index: ");
        UVSet.append(UVSpan);
    });
    return UVSet;
}

// This function prints the weather for the day of and the next 5 days.
function getInfo(citySearchTerm) {
    // The query URL for Open Weather Map is implemented here.
    var APIKey = "ced2cf879bb0aad6596f2794924c76f0";
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + citySearchTerm + "&APPID=" + APIKey;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        // There must NOT be a "404" or any other kind of error for the code to run.
        // This will ensure that only the names of real cities are part of our
        // search history.
        if(response.cod == "200") {
            // The search term must also NOT be duplicated, and we need to have
            // at least one search term for the code to work.
            if((searchHistory == null) || !(searchHistory.includes(citySearchTerm))) {
                searchHistory.push(citySearchTerm);
            }
            localStorage.setItem("searchHistory", JSON.stringify(searchHistory));

            // This will remove any previous weather information from the screen.
            renderPage();

            // The weather for today is created using this code.
            var weatherSet = response.list[0];
            var cityText = response.city.name;
            var header = $("<h1>").text(cityText + " (" + grabDate(response, 0) + ")");
            var imageSet = $("<img>").attr("src", "http://openweathermap.org/img/wn/" + weatherSet.weather[0].icon + ".png");
            var temper = weatherSet.main.temp;
            var tempSet = $("<p>").text("Temperature: " + Math.floor((temper - 273.15) * 1.8 + 32) + "\xB0F");
            var humiditySet = $("<p>").text("Humidity: " + weatherSet.main.humidity + "%");
            var windSpeedSet = $("<p>").text("Wind Speed: " + weatherSet.wind.speed + " MPH");
            var latitude = response.city.coord.lat;
            var longitude = response.city.coord.lon;
            var UVSet = grabUVData(APIKey, latitude, longitude);
            header.append(imageSet);
            $(".card-body").append(header, tempSet, humiditySet, windSpeedSet, UVSet);

            // The weather for the next 5 days is created using this code.
            for(var i = 0; i < 5; i++) {
                var index = 7 + (i * 8);
                var weatherSet2 = response.list[index];
                var header = $("<h5>").addClass("card-title");
                header.text(grabDate(response, index));
                var imageSet = $("<img>").attr("src", "http://openweathermap.org/img/wn/" + weatherSet2.weather[0].icon + ".png");
                var temper = weatherSet2.main.temp;
                var tempSet = $("<p>").text("Temperature: " + Math.floor((temper - 273.15) * 1.8 + 32) + "\xB0F");
                var humiditySet = $("<p>").text("Humidity: " + weatherSet2.main.humidity + "%");
                $(".card-body" + i).append(header, imageSet, tempSet, humiditySet);
            }

            // The page is fully displayed using this code, where the 5-day forecast
            // header is implemented, and the containers holding the weather information
            // also show.
            $(".forecastTitle").text("5-Day Forecast:");
            $(".col-lg-8").attr("style", "display: block");

        }
    });
}

// When the user clicks on the "search" button, this button listener will print
// today's weather and a 5-day forecast based on the input of the search box.
$(".btn-primary").on("click", function() {
    var cityNamer = $("#searchTerm").val();
    getInfo(cityNamer);
});

// When the user clicks on any of the buttons of cities, this button listener will
// print today's weather and the 5-day forecast for that city. The buttons created
// in the renderPage() method will NOT be responsive without explicitly mentioning
// the ID of them in this format!!!
$(document).on("click", "#cityBtn", function() {
    var cityName = $(this).attr("city");
    getInfo(cityName);
});

// Start with an empty page, along with any previous search terms obtained from
// local storage.
renderPage();

// This will print the weather information for the last searched city, given the 
// array of search terms is NOT empty.
if(searchHistory != null) {
    getInfo(searchHistory[searchHistory.length - 1]);
}