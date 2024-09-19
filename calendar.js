class Calendar {

    viewedYear = 0;
    viewedMonth = 0;

    events;

    constructor() {
        let date = new Date();
        this.viewedYear = date.getFullYear();
        this.viewedMonth = 10; //date.getMonth() + 1;
        this.events = [];

        this.assignEvents();

        /**
         * https://stackoverflow.com/a/9047794
         * Returns the week number for this date.  dowOffset is the day of week the week
         * "starts" on for your locale - it can be from 0 to 6. If dowOffset is 1 (Monday),
         * the week returned is the ISO 8601 week number.
         * @param int dowOffset
         * @return int
         */
        Date.prototype.getWeek = function (dowOffset) {
            /*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.meanfreepath.com */
            
                dowOffset = typeof(dowOffset) == 'number' ? dowOffset : 0; //default dowOffset to zero
                var newYear = new Date(this.getFullYear(),0,1);
                var day = newYear.getDay() - dowOffset; //the day of week the year begins on
                day = (day >= 0 ? day : day + 7);
                var daynum = Math.floor((this.getTime() - newYear.getTime() - 
                (this.getTimezoneOffset()-newYear.getTimezoneOffset())*60000)/86400000) + 1;
                var weeknum;
                //if the year starts before the middle of a week
                if(day < 4) {
                    weeknum = Math.floor((daynum+day-1)/7) + 1;
                    if(weeknum > 52) {
                        nYear = new Date(this.getFullYear() + 1,0,1);
                        nday = nYear.getDay() - dowOffset;
                        nday = nday >= 0 ? nday : nday + 7;
                        /*if the next year starts before the middle of
                        the week, it is week #1 of that year*/
                        weeknum = nday < 4 ? 1 : 53;
                    }
                }
                else {
                    weeknum = Math.floor((daynum+day-1)/7);
                }
                return weeknum;
            };
    }

    assignEvents(){

        let prevMonthButton = document.querySelector('.prev-month');

        if(prevMonthButton){
            prevMonthButton.addEventListener('click', () => {
                
                this.stepBackward();
            });
        }

        let nextMonthButton = document.querySelector('.next-month');

        if(nextMonthButton){
            nextMonthButton.addEventListener('click', () => {

                this.stepForward();
            });
        }

        /*
        * Napra kattintás
        */
       /*let dayButtons = document.querySelectorAll('.day');

       if(dayButtons){

         dayButtons.forEach((dayButton) => {

            dayButton.addEventListener('click', (event) => {
                let clickedDay = event.target;
                
                console.log("Day data" + clickedDay.getAttribute('date'));
    
                console.log(`Clicked day: ${clickedDay}`);
             });

         });
         
       }*/
    }

    stepForward(){
        this.viewedMonth++;
        console.log(this.viewedMonth);
        if(this.viewedMonth > 12){
            this.viewedMonth = 1;
            this.viewedYear++;
        }
        this.renderedEventsMargin = 1;
        this.render();
        
        //this.renderEvents();
    }

    stepBackward(){
        this.viewedMonth--;
        if(this.viewedMonth < 1){
            this.viewedMonth = 12;
            this.viewedYear--;
        }
        this.renderedEventsMargin = 1;
        this.render();
        //this.renderEvents();
    }

    monthlyView(){
        let currentMonthNumber = (this.viewedMonth /*+ 1*/);

        console.log(`Month: ${currentMonthNumber}, Year: ${this.viewedYear}`);

        // Generate calendar for the given month
        let dateToShow = new Date(this.viewedYear, (currentMonthNumber - 1),1);
        let dayOfTheWeek = dateToShow.getDay() == 0 ? 7 : dateToShow.getDay(); //Def: 0 - 6

        console.log(`Weekday of current month's FIRST: ${dayOfTheWeek}`);

        let viewData = [];
        viewData[0] = [];   //First week

        /**
         * =========== PREV month
         */ 
        let prevMonth = (currentMonthNumber - 1);
        prevMonth = prevMonth == 0 ? 12 : prevMonth;
        let prevMonthsYear = prevMonth == 12 ? this.viewedYear - 1 : this.viewedYear;

        let prevMonthDate = new Date(prevMonthsYear, prevMonth,0);
        let prevMonthDayCount = prevMonthDate.getDate();

        let iPrev = (prevMonthDayCount - (dayOfTheWeek - 2));

        while(iPrev <= prevMonthDayCount){
            viewData[0].push(this.makeDayObject( iPrev, `${prevMonthsYear}-${prevMonth}-${iPrev}`,"buffer"));
            iPrev++;
        }

        /**
         * =========== CURRENT month
         */
        let currentWeekIndex = 0;
        let dateToShowDayCount = new Date(this.viewedYear, currentMonthNumber,0);
        let dayIndex = (dayOfTheWeek - 1);

        for(let iCurr = 1; iCurr <= dateToShowDayCount.getDate(); iCurr++) {

            viewData[currentWeekIndex].push(this.makeDayObject(iCurr, `${prevMonthsYear}-${currentMonthNumber}-${iCurr}`, "normal"));
            dayIndex++;

            // Prepare the next week, if needed
            if(dayIndex == 7){
                dayIndex = 0;
                currentWeekIndex++;
                viewData[currentWeekIndex] = [];
            }
        }

        /**
         * =========== NEXT month
         */
        let lastWeekCount = viewData[viewData.length - 1].length;
        let bufferDays = 1;

        while(lastWeekCount < 7){
            viewData[viewData.length - 1].push(this.makeDayObject(bufferDays, `${prevMonthsYear}-${currentMonthNumber + 1}-${bufferDays}`, "buffer"));
            bufferDays++;
            lastWeekCount++;
        }

        console.log(viewData);

        return viewData;
    }

    render() {

        this.renderedEvents = {};

        /** Header */
        document.querySelector(".weekdays").innerHTML = "";

        let date = new Date(this.viewedYear, (this.viewedMonth - 1), 1);
        let monthName = date.toLocaleString('default', { month: 'long' });

        document.querySelector('#month-year').innerHTML = this.viewedYear + " " + monthName;

        // Localized Weekday names
        for(let i = 1; i <= 7; i++) {

            const dummyDate = new Date(2001, 0, i);
            const locale = new Intl.DateTimeFormat().resolvedOptions().locale;
            let weekDayName = dummyDate.toLocaleDateString(locale, { weekday: 'long' });

            let dayCell = document.createElement("div");
            dayCell.classList.add("weekday");
            dayCell.textContent = weekDayName;
            document.querySelector(".weekdays").appendChild(dayCell);
        }

        /** Content */
        this.renderContent();

        /** Events */
        this.renderEvents();
    }

    renderEvents(){
        let testEvents = [
            {
                id: 1,
                name: "Event 1",
                startDate: '2024-10-06',
                endDate: '2024-11-05',
                color: "red"
            },
            {
                id: 2,
                name: "Event 1.1",
                startDate: '2024-10-08',
                endDate: '2024-10-08',
                color: "grey"
            },
            {
                id: 3,
                name: "Event 1.2",
                startDate: '2024-10-10',
                endDate: '2024-10-10',
                color: "grey"
            },
            {
                id: 4,
                name: "Event 2",
                startDate: '2024-10-08',
                endDate: '2024-10-10',
                color: "blue"
            },
            {
                id: 5,
                name: "Event 3",
                startDate: '2024-10-06',
                endDate: '2024-10-15',
                color: "green"
            },
        ];

        // Rendezés, hogy a hoszabb események legyenek felül
        let sortedEvents = testEvents.sort((a, b) => {

            let diffA = (new Date(a.endDate) - new Date(a.startDate));
            let diffB = (new Date(b.endDate) - new Date(b.startDate));

            if (diffA > diffB) {
                return -1;
            }
            if (diffA < diffB) {
                return 1;
            }
            return 0;
        });

        sortedEvents.forEach((event) => {
            this.renderOneEvent(event);
        });

        //console.log(this.eventContainer);
        console.log(this.dayEvents);
    }

    renderedEventsMargin = 1;

    eventContainer = [];

    pendingEvents = {};

    renderedEvents = {};

    dayEvents = {};

    renderOneEvent(eventObject){

        let startDate = new Date(eventObject.startDate);
        let endDate = new Date(eventObject.endDate);
        let currentDate = new Date(eventObject.startDate);
        let currWeekDay = currentDate.getDay();

        let startDateFormatted = this.formatDate(startDate);
        let endDateFormatted = this.formatDate(endDate);

        console.log("START: " + startDate.toLocaleDateString());
        console.log("END: " + endDate.toLocaleDateString());

        while(currentDate <= endDate){

            let formattedCurrentDate = this.formatDate(currentDate);

            let dayDiv = document.querySelector('.day[date="' + formattedCurrentDate + '"]');

            // Következő hónapra átlógó esemény
            if((currentDate.getMonth() + 1) > this.viewedMonth){

                if(dayDiv == null){
                    console.log("Another month, it's day is not present: " + currentDate);
                    break;
                }

            } 
            // Előző hónapból átlóg a jelenlegi hónapba
            else if((currentDate.getMonth() + 1) < this.viewedMonth){

                if(dayDiv == null){
                    console.log("Another month, it's day is not YET present: " + currentDate);
                    currentDate = this.incrementDate(currentDate, 1);
                    currWeekDay = 1;
                    continue;
                }
            }

            // If sunday
            if(currWeekDay == 0){
                currWeekDay = 7;
            }

            /**
             * Insert the event div
             */
            if(dayDiv !== null){

                if(this.dayEvents[formattedCurrentDate] == undefined || this.dayEvents[formattedCurrentDate].length < 3){

                    var eventDiv = document.createElement("div");
                    eventDiv.classList.add("event");
                    eventDiv.style.backgroundColor = eventObject.color;

                    if(this.renderedEvents[eventObject.id] === undefined || currWeekDay == 1){
                        //eventDiv.textContent = eventObject.name;

                        let eventDivTitle = document.createElement("span");
                        eventDivTitle.classList.add("event-title");
                        eventDivTitle.textContent = eventObject.name;

                        eventDiv.appendChild(eventDivTitle);
                    }

                    // Start or end div
                    if(formattedCurrentDate == startDateFormatted){

                        eventDiv.classList.add("event-start");
                    } else if (formattedCurrentDate == endDateFormatted){

                        eventDiv.classList.add("event-end");
                    }

                    if(formattedCurrentDate == endDateFormatted || currWeekDay == 7){
                        eventDiv.style.width = "100%";
                    }

                    dayDiv.appendChild(eventDiv);

                } else {
                    // Increment the "Other events" block's number
                    console.log("Day is full: " + formattedCurrentDate);

                    let otherEventsDiv = dayDiv.querySelector(".other-events");

                    if(otherEventsDiv == null){

                        otherEventsDiv = document.createElement("div");
                        otherEventsDiv.classList.add("other-events");
                        otherEventsDiv.innerHTML = "+&nbsp;";
                        otherEventsDiv.title = "További események száma";

                        let otherEventsDivCounter = document.createElement("span");
                        otherEventsDivCounter.classList.add("other-events-counter");
                        otherEventsDivCounter.textContent = "1";

                        otherEventsDiv.appendChild(otherEventsDivCounter);

                        dayDiv.appendChild(otherEventsDiv);
                        
                    } else {
                        let otherEventsDivCounter = otherEventsDiv.querySelector(".other-events-counter");
                        let counter = parseInt(otherEventsDivCounter.textContent);
                        counter++;
                        otherEventsDivCounter.textContent = counter;
                    }
                }

                if(this.dayEvents[formattedCurrentDate] == undefined){
                    this.dayEvents[formattedCurrentDate] = [];
                }

                this.dayEvents[formattedCurrentDate].push(eventObject);

                this.renderedEvents[eventObject.id] = true;

                
            }

            currentDate = this.incrementDate(currentDate, 1);

            currWeekDay = currWeekDay == 7 ? 1 : currWeekDay + 1;
        }

        console.log('Diff: ' + ((endDate - startDate) / 1000 / 60 / 60 / 24));
    }

    // https://stackoverflow.com/a/45408480
    incrementDate(dateInput,increment) {
        var dateFormatTotime = new Date(dateInput);
        var increasedDate = new Date(dateFormatTotime.getTime() +(increment *86400000));
        return increasedDate;
    }

    renderContent() {
        
        let contentObject = document.querySelector(".calendar-content");

        if(contentObject){

            contentObject.innerHTML = "";
            this.dayEvents = [];

            let calendarData = this.monthlyView();

            calendarData.forEach((week, index) => {

                let weekRow = document.createElement("div");
                weekRow.classList.add("week");
                
                week.forEach(day => {
                    let dayCell = document.createElement("div");
                    dayCell.classList.add("day");
                    dayCell.setAttribute("date", day.date);
                    
                    if(day.type == "buffer"){
                        dayCell.classList.add("buffer");
                    }

                    dayCell.textContent = day.day;

                    /**
                     * Click event
                     */
                    dayCell.onclick = (event) => {
                        let clickedDayElement = event.currentTarget;
                        let currentDateAttr = clickedDayElement.getAttribute('date');

                        // title
                        var titleElement = document.querySelector('#event-container-header h3');
                        titleElement.textContent = `Események - ${currentDateAttr}`;

                        let listedEventsSubCont = document.querySelector('#event-subcontainer');
                        listedEventsSubCont.innerHTML = "";

                        if(this.dayEvents[currentDateAttr] !== undefined && listedEventsSubCont){

                            let clickedDayEvents = this.dayEvents[currentDateAttr];

                            clickedDayEvents.forEach(dayEvent => {

                                var listedEventElement = document.createElement("div");
                                listedEventElement.classList.add("listed-event-container");
                                listedEventElement.style.backgroundColor = dayEvent.color;

                                // title
                                var titleElement = document.createElement("h5");
                                titleElement.classList.add("listed-event-title");
                                titleElement.textContent = dayEvent.name;

                                listedEventElement.appendChild(titleElement);

                                // dates
                                var datesElement = document.createElement("p");
                                datesElement.classList.add("listed-event-dates");
                                datesElement.textContent = `${this.formatDate(new Date(dayEvent.startDate))} - ${this.formatDate(new Date(dayEvent.endDate))}`;

                                listedEventElement.appendChild(datesElement);

                                listedEventsSubCont.appendChild(listedEventElement);

                                console.log(`Clicked event: ${dayEvent.name}`);
                            });
                            
                            
                        }
                    };

                    weekRow.appendChild(dayCell);
                });

                document.querySelector(".calendar-content").appendChild(weekRow);
            });
        }
    }

    makeDayObject(day, date, type){

        return {
            day: day,
            date: date,
            type: type,
            events: []
        };
    }

    formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        return [year, month, day].join('-');
    }
}