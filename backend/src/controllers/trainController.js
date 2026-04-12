import { sampleTrains } from '../data/trains.js';

const dayMap = {
  0: 'Sun',
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat'
};

const getUniqueStations = () => {
  const stations = new Set();
  sampleTrains.forEach(train => {
    train.routeStops.forEach(stop => stations.add(stop.station));
  });
  return Array.from(stations).sort();
};

export const listStations = async (req, res) => {
  try {
    const stations = getUniqueStations();
    res.status(200).json({
      success: true,
      data: stations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// 🔥 FIXED SEARCH
export const searchTrains = async (req, res) => {
  try {
    const { fromStation, toStation, journeyDate } = req.query;

    if (!fromStation || !toStation) {
      return res.status(400).json({
        success: false,
        message: "fromStation and toStation are required"
      });
    }

    let filteredTrains = sampleTrains.filter(train => {
      const stations = train.routeStops.map(stop => stop.station.toLowerCase());

      const fromIndex = stations.findIndex(st =>
        st.includes(fromStation.toLowerCase())
      );

      const toIndex = stations.findIndex(st =>
        st.includes(toStation.toLowerCase())
      );

      return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
    });

    if (journeyDate) {
      const date = new Date(journeyDate);
      if (isNaN(date.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid journeyDate'
        });
      }

      const day = dayMap[date.getDay()];
      filteredTrains = filteredTrains.filter(train =>
        train.runsOn.includes(day)
      );
    }

    res.status(200).json({
      success: true,
      data: filteredTrains
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getTrainDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const train = sampleTrains.find(t => t.trainNumber === id);

    if (!train) {
      return res.status(404).json({
        success: false,
        message: 'Train not found'
      });
    }

    res.status(200).json({
      success: true,
      data: train
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getSeats = async (req, res) => {
  try {
    const { id } = req.params;
    const { classCode = 'SL', passengers = '1' } = req.query;

    const passengerCount = parseInt(passengers);
    if (isNaN(passengerCount) || passengerCount < 1 || passengerCount > 6) {
      return res.status(400).json({
        success: false,
        message: 'Invalid passenger count'
      });
    }

    const train = sampleTrains.find(t => t.trainNumber === id);
    if (!train) {
      return res.status(404).json({
        success: false,
        message: 'Train not found'
      });
    }

    const trainClass = train.classes.find(c => c.code === classCode);
    if (!trainClass) {
      return res.status(400).json({
        success: false,
        message: 'Class not found'
      });
    }

    const totalSeats = trainClass.coachCount * trainClass.seatsPerCoach;
    const availableSeats = Math.floor(totalSeats * (0.7 + Math.random() * 0.2));

    res.status(200).json({
      success: true,
      data: {
        trainNumber: train.trainNumber,
        classCode,
        totalSeats,
        availableSeats,
        passengers: passengerCount
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};