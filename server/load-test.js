const autocannon = require('autocannon');

const runLoadTest = async () => {
  const url = 'http://localhost:5000';
  
  console.log('Running load test for GET /health/live...');
  const resultLive = await autocannon({
    url: `${url}/health/live`,
    connections: 100, // concurrent
    pipelining: 1,
    duration: 10
  });
  console.log(autocannon.printResult(resultLive));

  console.log('Running load test for GET /api/v1/reports/found (Requires DB, might hit rate limits if not bypassed)...');
  const resultReports = await autocannon({
    url: `${url}/api/v1/reports/found`,
    connections: 250,
    pipelining: 1,
    duration: 10
  });
  console.log(autocannon.printResult(resultReports));
};

runLoadTest();

