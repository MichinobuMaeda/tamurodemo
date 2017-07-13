'use strict';

/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

const chai = require('chai');
const expect = chai.expect
const chaiHttp = require('chai-http')
chai.use(chaiHttp)

const conf = require('../conf.sample.js')
const {
  mongoose, LogStream, log, User, Group, Prim, Cred, Session, Log,
  getGroups, buildNumber, buildDate, buildArray, buildObject,
  isStringRequired, isStringOptional, isNumberOptional, isDateOptional,
  isUndefined, isNull, isString, isNumber, isDate, isObject, isArray,
} = require('../lib/model')

describe('model', function() {
  before(async () => {
    await mongoose.connect(conf.mongodb)
  })
  beforeEach(async () => {
    return mongoose.connection.db.dropDatabase()
  })
  afterEach(async () => {})
  after(async () => {
    await mongoose.disconnect()
  })
  describe('#isUndefined()', () => {
    it('should return variable is undefined or not.', () => {
      var v
      expect(isUndefined(v)).is.true
      expect(isUndefined(null)).is.false
      expect(isUndefined('')).is.false
      expect(isUndefined(1)).is.false
      expect(isUndefined(new Date())).is.false
      expect(isUndefined([])).is.false
      expect(isUndefined({})).is.false
    })
  })
  describe('#isNull()', () => {
    it('should return variable is null or not.', () => {
      var v
      expect(isNull(v)).is.false
      expect(isNull(null)).is.true
      expect(isNull('')).is.false
      expect(isNull(1)).is.false
      expect(isNull(new Date())).is.false
      expect(isNull([])).is.false
      expect(isNull({})).is.false
    })
  })
  describe('#isString()', () => {
    it('should return variable is a string or not.', () => {
      var v
      expect(isString(v)).is.false
      expect(isString(null)).is.false
      expect(isString('')).is.true
      expect(isString(1)).is.false
      expect(isString(new Date())).is.false
      expect(isString([])).is.false
      expect(isString({})).is.false
    })
  })
  describe('#isNumber()', () => {
    it('should return variable is a number or not.', () => {
      var v
      expect(isNumber(v)).is.false
      expect(isNumber(null)).is.false
      expect(isNumber('')).is.false
      expect(isNumber(1)).is.true
      expect(isNumber(new Date())).is.false
      expect(isNumber([])).is.false
      expect(isNumber({})).is.false
    })
  })
  describe('#isDate()', () => {
    it('should return variable is a number or not.', () => {
      var v
      expect(isDate(v)).is.false
      expect(isDate(null)).is.false
      expect(isDate('')).is.false
      expect(isDate(1)).is.false
      expect(isDate(new Date())).is.true
      expect(isDate([])).is.false
      expect(isDate({})).is.false
    })
  })
  describe('#isArray()', () => {
    it('should return variable is a array or not.', () => {
      var v
      expect(isArray(v)).is.false
      expect(isArray(null)).is.false
      expect(isArray('')).is.false
      expect(isArray(1)).is.false
      expect(isArray(new Date())).is.false
      expect(isArray([])).is.true
      expect(isArray({})).is.false
    })
  })
  describe('#isObject()', () => {
    it('should return variable is a object or not.', () => {
      var v
      expect(isObject(v)).is.false
      expect(isObject(null)).is.false
      expect(isObject('')).is.false
      expect(isObject(1)).is.false
      expect(isObject(new Date())).is.false
      expect(isObject([])).is.false
      expect(isObject({})).is.true
    })
  })
  describe('#isStringRequired()', () => {
    it('should return variable is a string with length > 0 or not.', () => {
      var v
      expect(isStringRequired(v)).is.false
      expect(isStringRequired(null)).is.false
      expect(isStringRequired('')).is.false
      expect(isStringRequired('a')).is.true
      expect(isStringRequired(1)).is.false
      expect(isStringRequired(new Date())).is.false
    })
  })
  describe('#isStringOptional()', () => {
    it('should return variable is a string if exists or not.', () => {
      var v
      expect(isStringOptional(v)).is.true
      expect(isStringOptional(null)).is.true
      expect(isStringOptional('')).is.true
      expect(isStringOptional('a')).is.true
      expect(isStringOptional(1)).is.false
      expect(isStringOptional(new Date())).is.false
    })
  })
  describe('#isNumberOptional()', () => {
    it('should return variable is a number if exists or not.', () => {
      var v
      expect(isNumberOptional(v)).is.true
      expect(isNumberOptional(null)).is.true
      expect(isNumberOptional('')).is.false
      expect(isNumberOptional(1)).is.true
      expect(isNumberOptional(new Date())).is.false
    })
  })
  describe('#isDateOptional()', () => {
    it('should return variable is a string if exists or not.', () => {
      var v
      expect(isDateOptional(v)).is.true
      expect(isDateOptional(null)).is.true
      expect(isDateOptional('')).is.false
      expect(isDateOptional(1)).is.false
      expect(isDateOptional(new Date())).is.true
    })
  })
  describe('#buildNumber()', () => {
    it('should return a casted number if possible or null.', () => {
      var v
      expect(buildNumber(v)).is.null
      expect(buildNumber(null)).is.null
      expect(buildNumber('')).is.null
      expect(buildNumber('a')).is.null
      expect(buildNumber(0)).to.equals(0)
      expect(buildNumber(1)).to.equals(1)
      expect(buildNumber("1")).to.equals(1)
      expect(buildNumber(".1")).to.equals(0.1)
      expect(buildNumber("1.")).to.equals(1)
      expect(buildNumber("-.1")).to.equals(-0.1)
      expect(buildNumber("-1.")).to.equals(-1)
      expect(buildNumber("1.1")).to.equals(1.1)
      expect(buildNumber("-1.1")).to.equals(-1.1)
      expect(buildNumber(new Date())).is.null
      expect(buildNumber([])).is.null
      expect(buildNumber({})).is.null
    })
  })
  describe('#buildDate()', () => {
    it('should return a casted date if possible or null.', () => {
      var v
      expect(buildDate(v)).is.null
      expect(buildDate(null)).is.null
      expect(buildDate('')).is.null
      expect(buildDate('a')).is.null
      expect(buildDate(0)).is.null
      expect(buildDate(1)).is.null
      expect(buildDate(new Date("2000/12/31")).getTime()
      ).to.equal(new Date("2000/12/31").getTime())
      expect(buildDate("2000/12/31").getTime()
      ).to.equal(new Date("2000/12/31").getTime())
      expect(buildDate("2000/12/31 5:06").getTime()
      ).to.equal(new Date("2000/12/31 5:06").getTime())
      expect(buildDate("2000-12-31T23:58:59Z").getTime()
      ).to.equal(new Date("2000-12-31T23:58:59Z").getTime())
      expect(buildDate("2000-12-31T23:58:59+09:00").getTime()
      ).to.equal(new Date("2000-12-31T23:58:59+09:00").getTime())
      expect(buildDate("2000-12-31T23:58:59+09:00").getTimezoneOffset()
      ).to.equal(-9 * 60)
      expect(buildDate([])).is.null
      expect(buildDate({})).is.null
    })
  })
  describe('#buildArray()', () => {
    it('should return a casted array.', () => {
      var v
      expect(buildArray(v)).to.have.members([])
      expect(buildArray(null)).to.have.members([])
      expect(buildArray('')).to.have.members([''])
      expect(buildArray('a')).to.have.members(['a'])
      expect(buildArray(0)).to.have.members([0])
      expect(buildArray(1)).to.have.members([1])
      expect(buildArray([])).to.have.members([])
      expect(buildArray([0, 1, 2])).to.have.members([0, 1, 2])
      expect(buildArray({})).to.deep.equal([{}])
    })
  })
  describe('#buildObject()', () => {
    it('should return a casted array.', () => {
      var v
      expect(buildObject(v)).to.deep.equal({})
      expect(buildObject(null)).to.deep.equal({})
      expect(buildObject('')).is.null
      expect(buildObject('a')).is.null
      expect(buildObject(0)).is.null
      expect(buildObject(1)).is.null
      expect(buildObject([])).is.null
      expect(buildObject([0, 1, 2])).is.null
      expect(buildObject({})).to.deep.equal({})
      expect(buildObject({a: "123"})).to.deep.equal({a: "123"})
    })
  })
  describe('#Prim.validate()', () => {
    it('should return a modified primaries object.', () => {
      expect(Prim.validate()).to.deep.equal({
        errors: [
          { path: 'top', error: 'required' },
          { path: 'admin', error: 'required' },
          { path: 'manager', error: 'required' },
        ]
      })
      expect(Prim.validate({
        top: "abc",
        admin: "def",
        manager: "xyz",
        ver: 1,
      })).to.deep.equal({
        top: "abc",
        admin: "def",
        manager: "xyz",
      })
      expect(Prim.validate({
        top: "abc",
        admin: "def",
        manager: "xyz"
      })).to.deep.equal({
        top: "abc",
        admin: "def",
        manager: "xyz",
      })
      expect(Prim.validate({
        admin: "def",
        manager: "xyz",
      })).to.deep.equal({
        errors: [ { path: 'top', error: 'required' } ]
      })
      expect(Prim.validate({
        top: "abc",
        manager: "xyz",
      })).to.deep.equal({
        errors: [ { path: 'admin', error: 'required' } ]
      })
      expect(Prim.validate({
        top: "abc",
        admin: "def",
      })).to.deep.equal({
        errors: [ { path: 'manager', error: 'required' } ]
      })
    })
  })
  describe('#User.validate()', () => {
    it('should return errors if not consistent.', async () => {
      expect(await User.validate()).to.deep.equal({
        errors: [ { path: 'name', error: 'required' } ]
      })
      expect(await User.validate({})).to.deep.equal({
        errors: [ { path: 'name', error: 'required' } ]
      })
      expect(await User.validate({
        name: "abc"
      })).to.deep.equal({
        name: "abc",
        profile: {},
      })
      expect(await User.validate({
        name: "abc",
        profile: null,
        ver: 0
      })).to.deep.equal({
        name: "abc",
        profile: {},
      })
      expect(await User.validate({
        name: "abc",
        profile: {},
        ver: 1
      })).to.deep.equal({
        name: "abc",
        profile: {},
      })
      expect(await User.validate({
        name: "abc",
        profile: { a: "xyz" },
        ver: 0
      })).to.deep.equal({
        name: "abc",
        profile: { a: "xyz" }, 
      })
      expect(await User.validate({
        name: "abc",
        profile: "xyz"
      })).to.deep.equal({
        errors: [ { path: 'profile', error: 'object' } ]
      })
      let user1 = await User.validate({
        name: "abc"
      })
      expect(user1).to.deep.equals({
        name: "abc",
        profile: {},
      })
      let user2 = await User.validate({
        name: "abc"
      })
      expect(user2).to.deep.equals({
        name: "abc",
        profile: {},
      })
      await (new User(user1)).save()
      expect(await User.validate({
        name: "abc"
      })).to.deep.equals({
        errors: [ { path: 'name', error: 'unique' } ]
      })
    })
  })
  describe('#Group.validate()', () => {
    it('should return errors if not consistent.', async () => {
      expect(await Group.validate()).to.deep.equal({
        errors: [ { path: 'name', error: 'required' } ]
      })
      expect(await Group.validate({})).to.deep.equal({
        errors: [ { path: 'name', error: 'required' } ]
      })
      expect(await Group.validate({
        name: "abc",
        gids: ["0000a00b12a0bb6c07a94c09", ""],
        uids: ["0000a17b2f4b806d6f206525"],
        ver: 0
      })).to.deep.equal({
        errors: [
          { path: 'gids.1', error: 'required' },
          { path: 'uids.0', error: 'reference' },
        ]
      })
      expect(await Group.validate({
        name: "abc",
        gids: ["0000a00b12a0bb6c07a94c09"],
        uids: ["0000a17b2f4b806d6f206525", ""]
      })).to.deep.equal({
        errors: [
          { path: 'gids.0', error: 'reference' },
          { path: 'uids.1', error: 'required' },
        ]
      })
      let group1 = await Group.validate({
        name: "abc"
      })
      expect(group1).to.deep.equal({
        name: "abc",
        gids: [],
        uids: [],
      })
      group1 = new Group(group1)
      expect(await Group.validate({
        name: "abc",
        gids: [group1._id.toString()],
      })).to.deep.equal({
        errors: [ { path: 'gids.0', error: 'reference' } ]
      })
      await group1.save()
      expect(await Group.validate({
        name: "abc",
        gids: [group1._id.toString()],
      })).to.deep.equal({
        errors: [ { path: 'name', error: 'unique' } ]
      })
      expect(await Group.validate({
        name: "def",
        gids: [group1._id.toString()]
      })).to.deep.equal({
        name: "def",
        gids: [group1._id.toString()],
        uids: [],
      })
      let user1 = await User.validate({
        name: "abc"
      })
      user1 = new User(user1)
      expect(await Group.validate({
        name: "def",
        uids: [user1._id.toString()],
      })).to.deep.equal({
        errors: [ { path: 'uids.0', error: 'reference' } ]
      })
      await user1.save()
      expect(await Group.validate({
        name: "def",
        uids: [user1._id.toString()]
      })).to.deep.equal({
        name: "def",
        gids: [],
        uids: [user1._id.toString()],
      })
    })
  })
  describe('#Cred.validate()', () => {
    it('should return errors if not consistent.', async () => {
      let user1 = await User.validate({
        name: "abc"
      })
      user1 = new User(user1)
      expect(await Cred.validate({
        uid: user1._id.toString(),
        provider: "password",
        authId: "def", attr: { password: "ghi" },
      })).to.deep.equal({
        errors: [ { path: 'uid', error: 'reference' } ]
      })
      await user1.save()
      expect(await Cred.validate()).to.deep.equal({
        errors: [
          { path: 'uid', error: 'required' },
          { path: 'provider', error: 'required' },
          { path: 'authId', error: 'required' },
        ]
      })
      expect(await Cred.validate({
        uid: user1._id.toString(),
        provider: "password",
        authId: "def",
        attr: { password: "xyz" },
        ver: 1
      })).to.deep.equal({
        uid: user1._id.toString(),
        provider: "password",
        authId: "def",
        attr: { password: "xyz" },
      })
      expect(await Cred.validate({
        uid: user1._id.toString(),
        provider: "password",
        authId: "def",
        attr: { password: "xyz" }
      })).to.deep.equal({
        uid: user1._id.toString(),
        provider: "password",
        authId: "def",
        attr: { password: "xyz" },
      })
      expect(await Cred.validate({
        provider: "password",
        authId: "def",
        attr: { password: "xyz" }
      })).to.deep.equal({
        errors: [ { path: 'uid', error: 'required' } ]
      })
      expect(await Cred.validate({
        uid: user1._id.toString(), authId:
        "def", attr: { password: "xyz" }
      })).to.deep.equal({
        errors: [ { path: 'provider', error: 'required' } ]
      })
      expect(await Cred.validate({
        uid: user1._id.toString(),
        provider: "dummy",
        authId: "def",
        attr: { password: "xyz" }
      })).to.deep.equal({
        errors: [ { path: 'provider', error: 'provider' } ]
      })
      expect(await Cred.validate({
        uid: user1._id.toString(),
        provider: "password",
        attr: { password: "xyz" }
      })).to.deep.equal({
        errors: [ { path: 'authId', error: 'required' } ]
      })
      expect(await Cred.validate({
        uid: user1._id.toString(),
        provider: "password",
        authId: "def",
        attr: {  }
      })).to.deep.equal({
        errors: [ { path: 'attr.password', error: 'required' } ]
      })
      expect(await Cred.validate({
        uid: user1._id.toString(),
        provider: "password",
        authId: "def",
        attr: "dummy"
      })).to.deep.equal({
        errors: [ { path: 'attr.password', error: 'required' } ]
      })
      expect(await Cred.validate({
        uid: user1._id.toString(),
        provider: "password",
        authId: "def"
      })).to.deep.equal({
        errors: [ { path: 'attr.password', error: 'required' } ]
      })
      let cred1 = await Cred.validate({
        uid: user1._id.toString(),
        provider: "password",
        authId: "def", attr: { password: "ghi" },
      })
      expect(cred1).to.deep.equal({
        uid: user1._id.toString(),
        provider: "password",
        authId: "def", attr: { password: "ghi" },
      })
      cred1 = new Cred(cred1)
      await cred1.save()
      let user2 = await User.create({
        name: "xyz"
      })
      await user2.save()
      expect(await Cred.validate({
        uid: user2._id.toString(),
        provider: "password",
        authId: "def", attr: { password: "xyz" },
      })).to.deep.equal({
        errors: [ { path: 'authId', error: 'unique' } ]
      })
      let cred2 = await Cred.validate({
        uid: user2._id.toString(),
        provider: "password",
        authId: "ghi", attr: { password: "xyz" },
      })
      expect(cred2).to.deep.equal({
        uid: user2._id.toString(),
        provider: "password",
        authId: "ghi", attr: { password: "xyz" },
      })
    })
  })
  describe('#User.create()', () => {
    it('should create the user entity.', async () => {
      let ret = await User.create({
        name: "abc"
      })
      let user = await User.findById(ret._id)
      expect(user.ver).to.equal(0)
      expect(user.name).to.equal("abc")
    })
    it('should return error for a invalid user object.', async () => {
      let ret = await User.create({})
      expect(ret).to.deep.equal({
        errors: [ { path: 'name', error: 'required' } ]
      })
    })
  })
  describe('#Group.create()', () => {
    it('should create and return a modified group object.', async () => {
      let ret = await Group.create({
        name: "abc"
      })
      let group = await Group.findById(ret._id)
      expect(group.ver).to.equal(0)
      expect(group.name).to.deep.equal("abc")
    })
    it('should return error for a invalid group object.', async () => {
      let ret = await Group.create({})
      expect(ret).to.deep.equal({
        errors: [ { path: 'name', error: 'required' } ]
      })
    })
  })
  describe('#Cred.create()', () => {
    it('should create and return a modified credential object.', async () => {
      let user1 = await User.create({
        name: "abc"
      })
      let ret = await Cred.create({
        uid: user1._id.toString(),
        provider: "password",
        authId: "def",
        attr: { password: "xyz" }
      })
      let cred = await Cred.findById(ret._id)
      expect(cred.ver).to.equal(0)
      expect(cred.uid).to.equal(user1._id.toString())
    })
    it('should return error for a invalid prime object.', async () => {
      let ret = await Cred.create({
        provider: "password",
        authId: "def",
        attr: { password: "xyz" }
      })
      expect(ret).to.deep.equal({
        errors: [ { path: 'uid', error: 'required' } ]
      })
    })
  })
  describe('#User.update()', () => {
    it('should update the user entity if not conflict.', async () => {
      let ret = await User.create({
        name: "abc"
      })
      let user = await User.findById(ret._id)
      expect(user._id.toString()).to.equal(ret._id.toString())
      user.name = "def"
      user.profile = { a: "xyz" }
      let modified = await User.update(user)
      user = await User.findById(ret._id)
      expect(user.ver).to.equal(1)
      expect(user.name).to.equal("def")
      expect(user.profile).to.deep.equal({ a: "xyz" })
    })
    it('should not update the user entity if error.', async () => {
      let ret = await User.create({
        name: "abc"
      })
      let user = await User.findById(ret._id)
      expect(user._id.toString()).to.equal(ret._id.toString())
      user.name = ""
      user.profile = { a: "xyz" }
      let error = await User.update(user)
      expect(error).to.deep.equal({
        errors: [ { path: 'name', error: 'required' } ]
      })
      user = await User.findById(ret._id)
      expect(user.ver).to.equal(0)
      expect(user.name).to.equal("abc")
      expect(user.profile).to.deep.equal({})
    })
    it('should not update the user entity if conflict.', async () => {
      let ret = await User.create({
        name: "abc"
      })
      let user = await User.findById(ret._id)
      expect(user._id.toString()).to.equal(ret._id.toString())
      ++ user.ver
      user.name = "def"
      user.profile = { a: "xyz" }
      let error = await User.update(user)
      expect(error).to.deep.equal({
        errors: [ { path: 'ver', error: 'match' } ]
      })
      user = await User.findById(ret._id)
      expect(user.ver).to.equal(0)
      expect(user.name).to.equal("abc")
      expect(user.profile).to.deep.equal({})
    })
  })
  describe('#Group.update()', () => {
    it('should update the group entity if not conflict.', async () => {
      let user1 = await User.create({
        name: "ABC"
      })
      let group1 = await Group.create({
        name: "123"
      })
      let ret = await Group.create({
        name: "abc"
      })
      let group = await Group.findById(ret._id)
      expect(group._id.toString()).to.equal(ret._id.toString())
      group.name = "def"
      group.gids = [group1._id.toString()]
      group.uids = [user1._id.toString()]
      let modified = await Group.update(group)
      group = await Group.findById(ret._id)
      expect(group.ver).to.equal(1)
      expect(group.name).to.equal("def")
      expect(group.gids).to.have.members([group1._id.toString()])
      expect(group.uids).to.have.members([user1._id.toString()])
    })
    it('should not update the group entity if error.', async () => {
      let user1 = await User.create({
        name: "123"
      })
      let group1 = await Group.create({
        name: "123"
      })
      let ret = await Group.create({
        name: "abc"
      })
      let group = await Group.findById(ret._id)
      expect(group._id.toString()).to.equal(ret._id.toString())
      group.name = ""
      group.gids = [group1._id.toString()]
      group.uids = [user1._id.toString()]
      let error = await Group.update(group)
      expect(error).to.deep.equal({
        errors: [ { path: 'name', error: 'required' } ]
      })
      group = await Group.findById(ret._id)
      expect(group.ver).to.equal(0)
      expect(group.name).to.equal("abc")
      expect(group.gids).to.have.members([])
      expect(group.uids).to.have.members([])
    })
    it('should not update the group entity if conflict.', async () => {
      let user1 = await User.create({
        name: "123"
      })
      let group1 = await Group.create({
        name: "123"
      })
      let ret = await Group.create({
        name: "abc"
      })
      let group = await Group.findById(ret._id)
      expect(group._id.toString()).to.equal(ret._id.toString())
      ++ group.ver
      group.name = "def"
      group.gids = [group1._id.toString()]
      group.uids = [user1._id.toString()]
      let error = await Group.update(group)
      expect(error).to.deep.equal({
        errors: [ { path: 'ver', error: 'match' } ]
      })
      group = await Group.findById(ret._id)
      expect(group.ver).to.equal(0)
      expect(group.name).to.equal("abc")
      expect(group.gids).to.have.members([])
      expect(group.uids).to.have.members([])
    })
  })
  describe('#Cred.update()', () => {
    it('should update the credential entity if not conflict.', async () => {
      let user1 = await User.create({
        name: "123"
      })
      let ret = await Cred.create({
        uid: user1._id.toString(),
        provider: "password",
        authId: "user1id",
        attr: { password: "user1pass" },
      })
      let cred = await Cred.findById(ret._id)
      expect(cred._id.toString()).to.equal(ret._id.toString())
      cred.authId = "def"
      cred.attr.password = "xyz"
      let modified = await Cred.update(cred)
      cred = await Cred.findById(ret._id)
      expect(cred.ver).to.equal(1)
      expect(cred.authId).to.equal("def")
      expect(cred.attr.password).to.deep.equal("xyz")
    })
    it('should not update the credential entity if error.', async () => {
      let user1 = await User.create({
        name: "123"
      })
      let ret = await Cred.create({
        uid: user1._id.toString(),
        provider: "password",
        authId: "user1id",
        attr: { password: "user1pass" },
      })
      let cred = await Cred.findById(ret._id)
      expect(cred._id.toString()).to.equal(ret._id.toString())
      cred.authId = ""
      cred.attr.password = "xyz"
      let error = await Cred.update(cred)
      expect(error).to.deep.equal({
        errors: [ { path: 'authId', error: 'required' } ]
      })
      cred = await Cred.findById(ret._id)
      expect(cred.ver).to.equal(0)
      expect(cred.authId).to.equal("user1id")
      expect(cred.attr.password).to.deep.equal("user1pass")
    })
    it('should not update the credential entity if conflict.', async () => {
      let user1 = await User.create({
        name: "123"
      })
      let ret = await Cred.create({
        uid: user1._id.toString(),
        provider: "password",
        authId: "user1id",
        attr: { password: "user1pass" },
      })
      let cred = await Cred.findById(ret._id)
      expect(cred._id.toString()).to.equal(ret._id.toString())
      ++ cred.ver
      cred.authId = "def"
      cred.attr.password = "xyz"
      let error = await Cred.update(cred)
      expect(error).to.deep.equal({
        errors: [ { path: 'ver', error: 'match' } ]
      })
      cred = await Cred.findById(ret._id)
      expect(cred.ver).to.equal(0)
      expect(cred.authId).to.equal("user1id")
      expect(cred.attr.password).to.deep.equal("user1pass")
    })
  })
  describe('#User.delete()', () => {
    it('should delete the user entity if not conflict.', async () => {
      let ret = await User.create({
        name: "abc"
      })
      let user = await User.findById(ret._id)
      expect(user._id.toString()).to.equal(ret._id.toString())
      let error = await User.delete(user)
      expect(error).to.deep.equal({})
      user = await User.findById(ret._id)
      expect(user).is.null
    })
    it('should not delete the user entity if conflict.', async () => {
      let ret = await User.create({
        name: "abc"
      })
      let user = await User.findById(ret._id)
      expect(user._id.toString()).to.equal(ret._id.toString())
      ++ user.ver
      let error = await User.delete(user)
      expect(error).to.deep.equal({
        errors: [ { path: 'ver', error: 'match' } ]
      })
      user = await User.findById(ret._id)
      expect(user._id.toString()).to.equal(ret._id.toString())
    })
  })
  describe('#Group.delete()', () => {
    it('should delete the group entity if not conflict.', async () => {
      let ret = await Group.create({
        name: "abc"
      })
      let group = await Group.findById(ret._id)
      expect(group._id.toString()).to.equal(ret._id.toString())
      let error = await Group.delete(group)
      expect(error).to.deep.equal({})
      group = await Group.findById(ret._id)
      expect(group).is.null
    })
    it('should not delete the group entity if conflict.', async () => {
      let ret = await Group.create({
        name: "abc"
      })
      let group = await Group.findById(ret._id)
      expect(group._id.toString()).to.equal(ret._id.toString())
      ++ group.ver
      let error = await Group.delete(group)
      expect(error).to.deep.equal({
        errors: [ { path: 'ver', error: 'match' } ]
      })
      group = await Group.findById(ret._id)
      expect(group._id.toString()).to.equal(ret._id.toString())
    })
  })
  describe('#Cred.delete()', () => {
    it('should delete the credential entity if not conflict.', async () => {
      let user1 = await User.create({
        name: "abc"
      })
      let ret = await Cred.create({
        uid: user1._id.toString(),
        provider: "password",
        authId: "def",
        attr: { password: "xyz" }
      })
      let cred = await Cred.findById(ret._id)
      expect(cred._id.toString()).to.equal(ret._id.toString())
      let error = await Cred.delete(cred)
      expect(error).to.deep.equal({})
      cred = await Cred.findById(ret._id)
      expect(cred).is.null
    })
    it('should not delete the credential entity if conflict.', async () => {
      let user1 = await User.create({
        name: "abc"
      })
      let ret = await Cred.create({
        uid: user1._id.toString(),
        provider: "password",
        authId: "def",
        attr: { password: "xyz" }
      })
      let cred = await Cred.findById(ret._id)
      expect(cred._id.toString()).to.equal(ret._id.toString())
      ++ cred.ver
      let error = await Cred.delete(cred)
      expect(error).to.deep.equal({
        errors: [ { path: 'ver', error: 'match' } ]
      })
      cred = await Cred.findById(ret._id)
      expect(cred._id.toString()).to.equal(ret._id.toString())
    })
  })
  describe('#getGroups()', () => {
    it('should get gids of gids.', async () => {
      let { prim, top, admin, manager, user1, cred1 } = await getTestPrimeObjects()
      let gids = await getGroups(cred1.uid)
      expect(gids).to.have.members([top._id.toString(), admin._id.toString(), manager._id.toString()])

      let group1 = await Group.create({name: "Group 1"})
      let group2 = await Group.create({name: "Group 2"})
      let user2 = await User.create({name: "User 2"})
      manager.gids.push(group1._id.toString())
      group1.gids.push(group2._id.toString())
      group2.gids.push(manager._id.toString())
      await manager.save()
      await group1.save()
      await group2.save()
      await user2.save()
      gids = await getGroups(cred1.uid)
      expect(gids).to.have.members([top._id.toString(), admin._id.toString(), manager._id.toString(),
        group1._id.toString(), group2._id.toString()])
      gids = await getGroups(user2._id)
      expect(gids).to.have.members([])
    })
  })
  describe('#Session.build()', () => {
    it('should return the session object from a credential.', async () => {
      let { prim, top, admin, manager, user1, cred1 } = await getTestPrimeObjects()
      let sess = await Session.build(cred1)
      expect(sess.uid).to.equal(user1._id.toString())
      expect(sess.provider).to.equal(cred1.provider)
      expect(sess.gids).to.have.members([top._id.toString(), admin._id.toString(), manager._id.toString()])
      expect(sess.admin).is.true
      expect(sess.manager).is.true
      expect(sess.createdAt.getTime()).is.not.greaterThan(new Date().getTime())
    })
    it('should return errors for invalid inputs.', async () => {
      let ret = await Session.build(null)
      expect(ret).to.deep.equal({
        errors: [ { path: '', error: 'required' } ]
      })
      ret = await Session.build({ provider: "password"})
      expect(ret).to.deep.equal({
        errors: [ { path: 'uid', error: 'string' } ]
      })
      ret = await Session.build({ uid: "dummy"})
      expect(ret).to.deep.equal({
        errors: [ { path: 'provider', error: 'string' } ]
      })
    })
  })
  describe('#Session.validate()', () => {
    it('should return the session object from a credential.', async () => {
      let { prim, top, admin, manager, user1, cred1 } = await getTestPrimeObjects()
      let sess = await Session.validate(cred1)
      expect(sess.uid).to.equal(user1._id.toString())
    })
    it('should return errors for invalid inputs.', async () => {
      let ret = await Session.validate({ provider: "password"})
      expect(ret).to.deep.equal({
        errors: [ { path: 'uid', error: 'string' } ]
      })
      let { prim, top, admin, manager, user1, cred1 } = await getTestPrimeObjects()
      let uid = user1._id.toString()
      ret = await Session.validate({ uid: uid, provider: "dummy" })
      expect(ret).to.deep.equal({
        errors: [ { path: 'provider', error: 'reference' } ]
      })
      await User.findByIdAndRemove(uid)
      ret = await Session.validate({ uid: uid, provider: "password" })
      expect(ret).to.deep.equal({
        errors: [ { path: 'uid', error: 'reference' } ]
      })
    })
  })
  describe('#Session.create()', () => {
    it('should create the session object from a credential.', async () => {
      let { prim, top, admin, manager, user1, cred1 } = await getTestPrimeObjects()
      let sess = await Session.create(cred1)
      expect(await Session.findById(sess._id.toString())).is.not.null
    })
    it('should not create the session for invalid inputs.', async () => {
      let { prim, top, admin, manager, user1, cred1 } = await getTestPrimeObjects()
      let uid = user1._id.toString()
      await User.findByIdAndRemove(uid)
      let ret = await Session.create({ uid: uid, provider: "password" })
      expect(ret).to.deep.equal({
        errors: [ { path: 'uid', error: 'reference' } ]
      })
      expect(await Session.count({}).exec()).to.equal(0)
    })
  })
  describe('#Session.delete()', () => {
    it('should delete the session object.', async () => {
      let { prim, top, admin, manager, user1, cred1 } = await getTestPrimeObjects()
      let sess = await Session.create(cred1)
      let sid = sess._id.toString()
      let ret = await Session.delete(sid)
      expect(ret).to.deep.equal({})
      expect(await Session.count({}).exec()).to.equal(0)
      expect(await Session.delete(sid)).to.deep.equal({
        errors: [ { path: '', error: 'reference' } ]
      })
    })
  })
  describe('LogStream', () => {
    it('should accept string and object messages.', async () => {
      let stream = new LogStream()
      stream.write([])
      log.info({ attr: { a:"xyz" } })
      await new Promise(resolve => setTimeout(resolve, 10))
      log.info('message1')
      await new Promise(resolve => setTimeout(resolve, 10))
      log.info('message2')
      await new Promise(resolve => setTimeout(resolve, 100))
      let logs = await Log.find({}).sort({ time: 1 }).exec()
      expect(logs).to.have.length(3)
      expect(logs[0].attr).to.deep.equal({ a:"xyz" })
      expect(logs[0].msg).to.equal('')
      expect(logs[1].attr).is.undefined
      expect(logs[1].msg).to.equal('message1')
      expect(logs[2].attr).is.undefined
      expect(logs[2].msg).to.equal('message2')
    })
  })
})

async function getTestPrimeObjects() {
  let top = await new Group(await Group.validate({
    name: "Top"
  }, false))
  let admin = await new Group(await Group.validate({
    name: "Admin"
  }, false))
  let manager = await new Group(await Group.validate({
    name: "Manager"
  }, false))
  let user1 = await new User(await User.validate({
    name: "User 1"
  }, false))
  top.gids = [ admin._id.toString(), manager._id.toString() ]
  admin.uids = [ user1._id.toString() ]
  manager.uids = [ user1._id.toString() ]
  let prim = await new Prim(Prim.validate({
    top: top._id.toString(),
    admin: admin._id.toString(),
    manager: manager._id.toString(),
  }))
  let cred1 = await new Cred(await Cred.validate({
    uid: user1._id.toString(),
    provider: "password",
    authId: "user1id",
    attr: { password: "user1pass" }
  }, false))
  await prim.save()
  await top.save()
  await admin.save()
  await manager.save()
  await user1.save()
  await cred1.save()
  return {
    prim: prim,
    top: top,
    admin: admin,
    manager: manager,
    user1: user1,
    cred1: cred1,
  }
}
