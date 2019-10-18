function digest({ data, forecast }) {
    const ms_in_day = 24 * 60 * 60 * 1000
    const now = new Date()
    const five_days_ago = new Date(now.setHours(0,0,0,0) - 5 * ms_in_day)
    const temp = []
    const prec = []
    const wind = []
    const cloud = []

    data.forEach(item => {
        switch(item.type) {
            case 'temperature':
                temp.push(item)
                break
            case 'precipitation':
                prec.push(item)
                break
            case 'wind speed':
                wind.push(item)
                break
            case 'cloud coverage':
                cloud.push(item)
                break
        }
    })

    const find_largest = key => array => array.length > 0 ? array.reduce((prev, curr) => prev[key] > curr[key] ? prev : curr) : undefined
    const find_smallest = array =>  array.length > 0 ? array.reduce((prev, curr) => prev.value < curr.value ? prev : curr) : undefined
    const last_five_days = array => array.filter(item => new Date(item.time) >= five_days_ago)
    const sum = array => array.reduce((acc, curr) => acc += curr.value, 0)
    const round = value => Math.round(value * 100) / 100

    const latest_measurements = () => {
        const latest_temp = find_largest('time')(temp) 
        const latest_prec = find_largest('time')(prec)
        const latest_wind = find_largest('time')(wind)
        const latest_cloud = find_largest('time')(cloud)
        return [latest_temp, latest_prec, latest_wind, latest_cloud]
    }

    const min_temperature = () => find_smallest(last_five_days(temp))
    const max_temperature = () => find_largest('value')(last_five_days(temp))
    const total_precipitation = () => [ round( sum(last_five_days(prec)) ), prec[0] ? prec[0].unit : 'mm' ]
    
    const average_wind_speed = () => {
        if (wind.length === 0) return ['no wind speed data', '']
        return [ round( sum(last_five_days(wind)) / last_five_days(wind).length ), wind[0].unit ]
    }
    
    const dominant_direction = () => {
        if (wind.length === 0) return 'no wind speed data'
        const directions = wind.reduce((acc, item) => ({...acc, [item.direction]: acc[item.direction] + 1}),
        {North: 0, Northeast: 0, East: 0, Southeast: 0, South: 0, Southwest: 0, West: 0, Northwest: 0})
        const largest = Object.values(directions).reduce((prev, curr) => prev > curr ? prev : curr)
        return Object.keys(directions).find(key => directions[key] === largest)
    }
    
    const average_cloud_coverage = () => {
        if (cloud.length === 0) return ['no cloud coverage data', '']
        return [ round( sum(last_five_days(cloud)) / last_five_days(cloud).length ), cloud[0].unit ]
    }
    
    const hourly_predictions = () => forecast

    return { latest_measurements, min_temperature, max_temperature, total_precipitation, average_wind_speed, dominant_direction, 
        average_cloud_coverage, hourly_predictions }
}