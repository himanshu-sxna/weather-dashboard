$(document).ready(function() {

    
    let endpoint = "https://api.openweathermap.org/data/2.5/weather?q=";
    let apiKey = "84208412c060ee3111e1021b1981a88a";

    // Luxon methods to set Date Time to UTC by default
    let DateTime = luxon.DateTime;
    luxon.Settings.defaultZoneName = "utc";


    // when the search btn is clicked the input value is stored as city on local storage
    $("#searchbtn").click(function(){
        localStorage.setItem("city",$("#searchInput").val());
       getWeather();

       // the input value is added to dropdown menu: My Cities
       $(".dropdown-menu").append(`<li><button class="dropdown-item">${$("#searchInput").val()}</button>
       </li>`)
    });

    //call the weather when cities are selected from the dropdown menu
    $(".dropdown-menu").on("click", ".dropdown-item", function() {
        localStorage.setItem("city",$(this).html());
        getWeather();
    });

    //if there is no city stored in local storage it displays "Search for a city" on the page
    if (localStorage.getItem("city") === null) {
        $("#forecast-header").text("Search for a city");
      } else {// if there is a city stored its loaded on App start
        getWeather();
      }
    
      /* 
        the below function gets the current weather and displays it on the main weather card.
        it makes an ajax call using the city name as the parameter 
        luxon is laso used to display the searched city's local date and time
      */
    function getWeather(){
 
       let city =  localStorage.getItem("city");
       

        $.ajax({
            url: endpoint + city + "&units=metric&appid=" + apiKey,
            method: "GET",
            success: function (CurrResponse) {
    
                //console.log(CurrResponse);
                
                // setting the searched city's time using offset value from response.
                let time = ( Date.now() + (CurrResponse.timezone*1000));
    
                $("#curr-date").html("<strong> Time: </strong>" + DateTime.fromMillis(time).toFormat("EEE',' ff"));
                
                $("#city-name").html(CurrResponse.name + ", " + CurrResponse.sys.country);
    
                $("#feels-like").html(("<strong>Feels like:</strong> " + CurrResponse.main.feels_like + "&deg;C"));
    
                $("#temp").html(("<strong>Temp:</strong> " + CurrResponse.main.temp + "&deg;C"));
    
                $("#humidity").html(("<strong>Humidity: </strong>"+ CurrResponse.main.humidity + "%"));
    
                $("#wind").html(("<strong>Wind Speed: </strong>" + CurrResponse.wind.speed + " metre/sec"));
    
                $("#weather-desc").html(CurrResponse.weather[0].description);
                $("weather-desc").css(" text-transform", "capitalize");
                
                $("#weather-icon").show();
                $("#weather-icon").attr("src", "http://openweathermap.org/img/wn/" + CurrResponse.weather[0].icon + "@2x.png")

                $("#uvbtn").show();

                $("#forecast-header").html("5 Day Forecast");
                

                // store the city name and coordinates to local storage
                localStorage.setItem("lat", CurrResponse.coord.lat); 
    
                localStorage.setItem("long", CurrResponse.coord.lon);

                localStorage.setItem("city", city);

                localStorage.setItem("timeOffset", time);

                // belwo functions fetch UV Index and 5 day Forecast
                getUVIndex();
                getForecast();
            },

            // very basic error handling for ajax
            error: $("#forecast-header").html("Couldn't fetch data: check city name or internet connection")
        })

    }
    
    /*
        the belwo function makes an ajax call for the UV Index based on co ordinates
        latitude & longitude is fetched form local storage 
    */
    function getUVIndex(){

        let lat = localStorage.getItem("lat");
        let long = localStorage.getItem("long");

        $.ajax({

            url: "http://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + long + "&appid=" + apiKey,
            method: "GET", 
            success: function (UVresponse) {

                let uvIndex = UVresponse.value;

                $("#uvindex").html(uvIndex);

                // based on the UV Index response the below snippets are displayed
                switch (true) {
                    case uvIndex <= 3:
                        
                        $("#uvindex-rating").html("Low");
                        $("#uvindex-rating").css("color", "#5aba22");
                        $("#uvindex-desc").html("A UV index reading of 0 to 3 means low danger from the Sun's UV rays for the average person.Wear sunglasses on bright days. If you burn easily, cover up and use broad spectrum SPF 30+ sunscreen.");
                        break;
                    
                    case uvIndex > 3 && uvIndex <= 6:
                        $("#uvindex-rating").html("Moderate");
                        $("#uvindex-rating").css("color", "#eeed38");
                        $("#uvindex-desc").html("A UV index reading of 3 to 6 means moderate risk of harm from unprotected sun exposure. Stay in shade near midday when the Sun is strongest. If outdoors, wear sun-protective clothing, a wide-brimmed hat, and UV-blocking sunglasses.");
                        break;

                    case uvIndex > 6 && uvIndex <= 8:
                        $("#uvindex-rating").css("color", "#f58200")
                        $("#uvindex-rating").html("High");
                        $("#uvindex-desc").html("A UV index reading of 6 to 8 means high risk of harm from unprotected sun exposure. Protection against skin and eye damage is needed.Reduce time in the sun between 10 a.m. and 4 p.m. If outdoors, seek shade and wear sun-protective clothing, a wide-brimmed hat, and UV-blocking sunglasses. .");
                        break;

                    case uvIndex >8 && uvIndex <= 11:
                        $("#uvindex-rating").css("color", "#f00")
                        $("#uvindex-rating").html("Very High");
                        $("#uvindex-desc").html("A UV index reading of 8 to 11 means very high risk of harm from unprotected sun exposure. Take extra precautions because unprotected skin and eyes will be damaged and can burn quickly.Minimize sun exposure between 10 a.m. and 4 p.m. If outdoors, seek shade and wear sun-protective clothing, a wide-brimmed hat, and UV-blocking sunglasses.");
                        break;
                     
                    case uvIndex > 11:
                        $("#uvindex-rating").css("color", "#c33fad")
                        $("#uvindex-rating").html("Extreme");
                        $("#uvindex-desc").html("	A UV index reading of 11 or more means extreme risk of harm from unprotected sun exposure. Take all precautions because unprotected skin and eyes can burn in minutes.Try to avoid sun exposure between 10 a.m. and 4 p.m. If outdoors, seek shade and wear sun-protective clothing, a wide-brimmed hat, and UV-blocking sunglasses.");
                        break;
                }
            },

            //below error case  was causing bugs 
            //error: $("#forecast-header").text("Couldn't fetch data: check city name or internet connection")
        })
    }

    /*
        function does an ajax call for 5 day forevcast
        it then runs a for loop to iterate for  the 5 cards that display each category
    */
    function getForecast(){
        
        $.ajax({

            url: "https://api.openweathermap.org/data/2.5/onecall?lat=" + localStorage.getItem("lat") + "&lon=" + localStorage.getItem("long") + "&exclude=current,minutely,hourly,alerts&units=metric&appid=" + apiKey,
            method: "GET",
            dataType: "json",
            success: function (forecastResponse){

                for(let x = 1; x<=5; x++){

                    $(`#head${x}`).html(function(){

                        let getOffset =  localStorage.getItem("timeOffset");
     
                        let setDate = (DateTime.fromMillis(+getOffset)).plus({ days: x }).toFormat("EEE',' dd LLL");
     
                         return setDate;
                     })
     
                     $(`#desc${x}`).html(forecastResponse.daily[x].weather[0].description);
                     $(`#desc${x}`).css("text-transform", "capitalize");
     
                     $(`#temp${x}`).html("<strong>Temp:</strong> " + forecastResponse.daily[x].temp.day + "&degC");
                     
                     $(`#iconday${x}`).show();
                     $(`#iconday${x}`).attr("src",`http://openweathermap.org/img/wn/${forecastResponse.daily[x].weather[0].icon}@2x.png` )
     
                     $(`#humidity${x}`).html(`<strong>Humidity: </strong>${forecastResponse.daily[x].humidity}%`);
     
                     $(`#uvindex${x}`).html(`<strong>UV Index: </strong>${forecastResponse.daily[x].uvi}`);

                };

                
            },

            error: $("forecast-header").text("Couldn't fetch data: check city name or internet connection")
        })    
    }
});
