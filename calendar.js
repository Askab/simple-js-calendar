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
        this.render();
    }

    stepBackward(){
        this.viewedMonth--;
        if(this.viewedMonth < 1){
            this.viewedMonth = 12;
            this.viewedYear--;
        }
        this.render();
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
        /**
         * Test
         */
        let startDate = new Date("2024-8-02");
        let endDate = new Date("2024-8-24");

        let currentDate = new Date("2024-8-02");

        endDate.setDate(endDate.getDate() + 1);

        let currWeekDay = 0; //startDate.getDay();
        do {

            // Event's first day
            if(this.formatDate(currentDate) == this.formatDate(startDate)){
                let dayDiv = document.querySelector('.day[date="' + this.formatDate(startDate) + '"]');
                
                let eventStartDiv = document.createElement("div");
                eventStartDiv.classList.add("long-event");
                eventStartDiv.textContent = "Long Event";

                dayDiv.appendChild(eventStartDiv);
            }

            // Monday
            if(currentDate.getDay() == 1){
                let dayDiv = document.querySelector('.day[date="' + this.formatDate(currentDate) + '"]');
                
                let eventStartDiv = document.createElement("div");
                eventStartDiv.classList.add("long-event");
                //eventStartDiv.classList.add("long-event");
                eventStartDiv.textContent = "Long Event";

                dayDiv.appendChild(eventStartDiv);
            }

            console.log('CURR WEEKDAY NUM:' + currentDate.getDay());

            if(currentDate.getDay() == 0 && currWeekDay < 7){

                let insertedEventElement = document.querySelector('.long-event');

                if(insertedEventElement){
                    console.log("Width: " + insertedEventElement.offsetWidth);
                    console.log('FUCK ME -> ' + currWeekDay);
                    insertedEventElement.style.width = (14 * (1 + currWeekDay)) + '%'; //insertedEventElement.offsetWidth + insertedEventElement.offsetWidth;
                }

                currWeekDay = 1;
                
                //break;
            } else if(currentDate.getDay() == 0 && currWeekDay == 7) {

            }

            currWeekDay++;

            



            console.log(currentDate);

            currentDate.setDate(currentDate.getDate() + 1);

        } while((endDate - currentDate) != 0);

        //console.log(difference);


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