import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AppointmentScheduler = () => {
  const [date, setDate] = useState<Date | null>(new Date());

  return (
    <div>
      <h3 className="font-semibold">Schedule an Appointment</h3>
      <DatePicker selected={date} onChange={setDate} showTimeSelect dateFormat="Pp" />
    </div>
  );
};

export default AppointmentScheduler;
