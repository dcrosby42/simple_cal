
const CalendarViewComponent = Vue.component('calendar-view', {
    props: {
        calendar: Object,
    },

    data() {
        return {
            showWeekends: this.calendar.config.showWeekends === true
        }
    },

    template: `
    <div class="calendar pure-g">
      <div class="pure-u-1">
        <input type="checkbox" id="showWeekendsCheckbox" v-model="showWeekends">
        <label for="showWeekendsCheckbox">Weekends?</label>
      </div>
      <div class="pure-u-2-24">
      </div>
      <calendar-grid 
        class="pure-u-20-24" 
        :showWeekends="showWeekends" 
        :startDateIso="calendar.config.startDate"
        :endDateIso="calendar.config.endDate"
        :items="calendar.items"
      />
      <div class="pure-u-2-24">
      </div>
    </div>
  `,
})

export { CalendarViewComponent }