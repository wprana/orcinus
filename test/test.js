'use strict';

global.test = true;

var should = require('should');
var chp = require('child_process');
var fs = require('fs');
var orcinusCreate = require('../lib/create');
var orcinusRemove = require('../lib/rm');
const timeout = 120000;
const deployTimeout = 40000

// TODO fix me
// Check for docker binary and aksaramaya's docker image before running unit testing.
// Make sure there is no container running inside docker
// 
// var orcinusPs = require('../lib/ps');

describe('Orcinus', function() {
  describe('Create', function() {
    it('should be able to create a cluster instance via API', function(done) {
      this.timeout(timeout);
      let data = {
      	"stack" : "orcinus-unit-testing-stack",
      	"services": {
          "orcinus-ut-web": {
            "ports" : [
              "7001:7001",
            ],
            "environment" : [
	      "FOO=bar",
            ],
            "network": "orcinus-unit-testing-stack",
            "image": "aksaramaya/docker-http-server:v1",
            "cpu": "1",
            "memory": "128mb"
          }
      	}
      }
      orcinusCreate.init(data);
      setTimeout(() => { // wait for docker
        let cmd = 'docker ps | sed -n 2,1p | grep "orcinus-ut-web" | cut -d\' \' -f 1';
        chp.exec(cmd, (err, stdout, stderr) => {
          stdout.length.should.greaterThan(10); // Container ID length was 12
          orcinusRemove.init(data);
          setTimeout(() => {
            done();
          }, 5000);
        });
       }, deployTimeout);
    });
    it('should be able to create a cluster instance from a manifest file', function(done) {
      this.timeout(timeout);
      let data = {
        "stack" : "orcinus-unit-testing-stack",
      	"services": {
          "orcinus-ut-web": {
            "ports" : [
              "7002:7002",
            ],
            "environment" : [
              "FOO=bar",
            ],
            "network": "orcinus-unit-testing-stack",
            "image": "aksaramaya/docker-http-server:v1",
            "cpu": "1",
            "memory": "128mb"
          }
        }
      }
      fs.writeFileSync('./test/test.json', JSON.stringify(data));
      chp.exec('cd ' + process.cwd() + ' && node cli.js create -f test/test.json', (err, stdout, stderr) => {
        console.log(stdout);
        setTimeout(() => { // wait for docker
          let cmd = 'docker ps | sed -n 2,1p | grep "orcinus-ut-web" | cut -d\' \' -f 1';
          chp.exec(cmd, (err, stdout, stderr) => {
            stdout.length.should.greaterThan(10); // Container ID length was 12
    	    chp.exec('cd ' + process.cwd() + ' && node cli.js rm -f test/test.json');
            setTimeout(() => {
              done();
            }, 5000);
          });
        }, deployTimeout);
      });
    });
    it('should be fail to initialize cluster with no service', function(done) {
      this.timeout(timeout);
      let data = {
        "stack" : "orcinus-unit-testing-stack",
      }
      try {
        orcinusCreate.init(data);
      } catch(e) {
        let cmd = 'docker ps | sed -n 2,1p | grep orcinus-ut-web | cut -d\' \' -f 1';
        chp.exec(cmd, (err, stdout, stderr) => {
          done();
        });
      }
    });
    it('should be fail to initialize cluster with non-string stack name', function(done) {
      this.timeout(timeout);
      let data = {
        "stack" : 123,
        "services": {
          "orcinus-ut-web": {
            "image": "aksaramaya/docker-http-server:v1",
            "cpu": "1",
            "memory": "128mb"
          }
        }
      }
      try {
        orcinusCreate.init(data);
      } catch(e) {
        done();
      }
    });
  });
});
