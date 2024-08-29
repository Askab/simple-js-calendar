class Calendar {

    viewedYear = 0;
    viewedMonth = 0;

    events;

    constructor() {
        let date = new Date();
        this.viewedYear = 2025;//date.getFullYear();
        this.viewedMonth = 1;//date.getMonth() + 1;
        this.events = [];
    }

    monthlyView(){
        console.log(`Month: ${this.viewedMonth}, Year: ${this.viewedYear}`);
        // Generate calendar for the given month
        let dateToShow = new Date(this.viewedYear, (this.viewedMonth - 1),1);
        let dayOfTheWeek = dateToShow.getDay() == 0 ? 7 : dateToShow.getDay(); //Def: 0 - 6

        console.log(`Weekday of current month's FIRST: ${dayOfTheWeek}`);

        let viewData = [];
        viewData[0] = [];   //First week

        /**
         * =========== PREV months last days
         */ 
        let prevMonth = (this.viewedMonth - 1);
        prevMonth = prevMonth == 0 ? 12 : prevMonth;
        let prevMonthsYear = prevMonth == 12 ? this.viewedYear - 1 : this.viewedYear;

        let prevMonthDate = new Date(prevMonthsYear, prevMonth,0);
        let prevMonthDayCount = prevMonthDate.getDate();

        let iPrev = (prevMonthDayCount - (dayOfTheWeek - 2));

        while(iPrev <= prevMonthDayCount){
            console.log(iPrev + "Prev MONT");
            viewData[0].push(this.makeDayObject(iPrev, "buffer"));
            iPrev++;
        }

        /**
         * =========== CURRENT month
         */
        let currentWeekIndex = 0;
        let dateToShowDayCount = new Date(this.viewedYear, this.viewedMonth,0);
        let dayIndex = (dayOfTheWeek - 1);

        for(let iCurr = 1; iCurr <= dateToShowDayCount.getDate(); iCurr++) {

            viewData[currentWeekIndex].push(this.makeDayObject(iCurr, "normal"));
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
            console.log(lastWeekCount + " Next MONT");
            viewData[viewData.length - 1].push(this.makeDayObject(bufferDays, "buffer"));
            bufferDays++;
            lastWeekCount++;
        }

        console.log(viewData);
    }

    makeDayObject(day, type){

        return {
            day: day,
            type: type,
            events: []
        };
    }
}