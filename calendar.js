class Calendar {

    viewedYear = 0;
    viewedMonth = 0;

    events;

    constructor() {
        let date = new Date();
        this.viewedYear = date.getFullYear();
        this.viewedMonth = date.getMonth() + 1;
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
                title: "Event 1",
                startDate: '2024-10-06',
                endDate: '2024-11-05',
                color: "red"
            },
            {
                title: "Event 2",
                startDate: '2024-10-07',
                endDate: '2024-10-10',
                color: "blue"
            },
            {
                title: "Event 3",
                startDate: '2024-10-06',
                endDate: '2024-10-15',
                color: "green"
            },
        ];

        testEvents.forEach((event) => {
            this.renderOneEvent(event);
        });
    }

    renderedEventsMargin = 1;

    renderOneEvent(eventObject){
        /**
         * Test
         */
        let startDateString = eventObject.startDate;
        let endDateString = eventObject.endDate;

        let startDate = new Date(startDateString);
        let endDate = new Date(endDateString);
        let currentDate = new Date(startDateString);

        console.log("START: " + startDate.toLocaleDateString());
        console.log("END: " + endDate.toLocaleDateString());

        let currWeekDay = currentDate.getDay();
        let isStartWeek = true;

        while(currentDate <= endDate){

            // Következő hónapra átlógó esemény
            if((currentDate.getMonth() + 1) > this.viewedMonth){
                let dayDiv = document.querySelector('.day[date="' + this.formatDate(currentDate) + '"]');

                if(dayDiv == null){
                    console.log("Another month, it's day is not present: " + currentDate);
                    break;
                }

            } 
            // Előző hónapból átlóg a jelenlegi hónapba
            else if((currentDate.getMonth() + 1) < this.viewedMonth){

                let dayDiv = document.querySelector('.day[date="' + this.formatDate(currentDate) + '"]');

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

            var eventStartDiv;
            
            /**
             * (currWeekDay == 1 && (currentDate.getMonth() + 1) < this.viewedMonth)
             * Ha az előző hónapban kezdődik
             */
            if(currWeekDay == 1 || currentDate.getTime() === startDate.getTime() || (currWeekDay == 1 && (currentDate.getMonth() + 1) < this.viewedMonth)){
                let dayDiv = document.querySelector('.day[date="' + this.formatDate(currentDate) + '"]');
                if(dayDiv !== null){

                    eventStartDiv = document.createElement("div");
                    eventStartDiv.classList.add("long-event");
                    eventStartDiv.textContent = eventObject.title;
                    eventStartDiv.style.backgroundColor = eventObject.color;

                    dayDiv.appendChild(eventStartDiv);

                    let dayDivTopDistance = (dayDiv.getBoundingClientRect().top + 10);

                    //this.renderedEventsMargin = dayDivTopDistance;

                    eventStartDiv.style.top = (dayDivTopDistance + this.renderedEventsMargin + 10) + 'px';
                    
                } else {
                    console.log("Undefined Day div: " + this.formatDate(currentDate));
                }

                if(currentDate.getTime() !== startDate.getTime()){
                    isStartWeek = false;
                }
            }

            if(isStartWeek == true){

                // HA a kezdő dátum, és a vég dátum ugyan azon a héten van
                let startEndDiffInDays = ((endDate - startDate) / 1000 / 60 / 60 / 24) + 1;
                let startDayOfWeek = startDate.getDay();
                startDayOfWeek = (startDayOfWeek == 0 ? 7 : startDayOfWeek);

                if(startEndDiffInDays <= 7 && startDate.getWeek() == endDate.getWeek()){

                    console.log("7 < DIff: " + startEndDiffInDays);
                    eventStartDiv.style.width = (14 * startEndDiffInDays) + '%';
                } else {
                    // A 8 azért kell, mert 7-ből vonna ki,ami vasárnap esetében 0 lenne
                    eventStartDiv.style.width = (14 * (8 - startDayOfWeek)) + '%';
                }
                
                
            } else {
                eventStartDiv.style.width = (14 * currWeekDay) + '%';
            }

            if(currWeekDay == 7){
                currWeekDay = 1;
                //eventStartDiv.style.width = (14 * (1 + currWeekDay)) + '%';
            } else {
                currWeekDay++;
            }

            currentDate = this.incrementDate(currentDate, 1);
        }

        this.renderedEventsMargin += 30;

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

                    weekRow.appendChild(dayCell);

                    //console.log(`Day: ${day.day}, Type: ${day.type}, Events: ${day.events.length}`);
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
    
        /*if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;*/
    
        return [year, month, day].join('-');
    }
}