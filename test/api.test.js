const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server/index'); // Adjust the path as necessary
const expect = chai.expect;

chai.use(chaiHttp);

describe('API Endpoints', () => {
  it('should fetch GIFs', (done) => {
    chai.request(server)
      .get('/search-gifs?q=funny')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        done();
      });
  });
});
