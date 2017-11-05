/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import cls from 'continuation-local-storage'
import Sequelize from 'sequelize'
import {LOG_LEVEL, PROVIDER, GROUP_ROLE, PREFERENCE} from './constants'

export const model = async conf => {

  const namespace = cls.createNamespace('transaction-namespace')
  Sequelize.useCLS(namespace)
  const db = new Sequelize(conf.dbUri, conf.dbOptions)

  const DEF_ID = {
    type: Sequelize.TEXT,
    primaryKey: true,
  }

  const DEF_VER = {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    },
  }

  const DEF_VISIBLE_ID = {
    type: Sequelize.TEXT,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true,
    }
  }

  const DEF_PROVIDER = {
    type: Sequelize.TEXT,
    allowNull: false,
    validate: {
      isIn: [Object.values(PROVIDER)]
    },
  }
  
  const Group = db.define('group', {
    _id: DEF_ID,
    ver: DEF_VER,
    name: DEF_VISIBLE_ID,
    role: {
      type: Sequelize.TEXT,
      validate: {
        isIn: [Object.values(GROUP_ROLE)]
      },
    },
    desc: {
      type: Sequelize.TEXT,
    },
  }, {
    freezeTableName: true,
    indexes: [
      {fields: ['role']},
    ],
  })

  const User = db.define('user', {
    _id: DEF_ID,
    ver: DEF_VER,
    name: DEF_VISIBLE_ID,
    profiles: {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    desc: {
      type: Sequelize.TEXT,
    },
  }, {
    freezeTableName: true,
  })
  
  const SubGroup = db.define('subGroup', {
    gid: {
      type: Sequelize.TEXT,
      primaryKey: true,
    },
    sid: {
      type: Sequelize.TEXT,
      primaryKey: true,
    },
  }, {
    freezeTableName: true,
  })
  
  Group.belongsToMany(Group, {
    as: 'Groups',
    through: 'subGroup',
    foreignKey: 'sid'
  })

  Group.belongsToMany(Group, {
    as: 'SubGroups',
    through: 'subGroup',
    foreignKey: 'gid'
  })

  const Member = db.define('member', {
    gid: {
      type: Sequelize.TEXT,
      primaryKey: true,
    },
    uid: {
      type: Sequelize.TEXT,
      primaryKey: true,
    },
  }, {
    freezeTableName: true,
  })

  User.belongsToMany(Group, {
    through: 'member',
    foreignKey: 'uid'
  })

  Group.belongsToMany(User, {
    through: 'member',
    foreignKey: 'gid'
  })

  const Owner = db.define('owner', {
    gid: {
      type: Sequelize.TEXT,
      primaryKey: true,
    },
    uid: {
      type: Sequelize.TEXT,
      primaryKey: true,
    },
  }, {
    freezeTableName: true,
  })

  User.belongsToMany(Group, {
    as: 'OwnedGroups',
    through: 'owner',
    foreignKey: 'uid'
  })

  Group.belongsToMany(User, {
    as: 'Owners',
    through: 'owner',
    foreignKey: 'gid'
  })
  
  const Cert = db.define('cert', {
    uid: {
      type: Sequelize.TEXT,
      primaryKey: true,
      allowNull: false,
    },
    provider: {
      type: Sequelize.TEXT,
      primaryKey: true,
      allowNull: false,
    },
    ver: DEF_VER,
    key: {
      allowNull: false,
      type: Sequelize.TEXT,
    },
    secret: {
      type: Sequelize.TEXT,
      defaultValue: null,
    },
  }, {
    freezeTableName: true,
    indexes: [
      {
        unique: true,
        fields: ['uid', 'provider'],
      },
      {
        unique: true,
        fields: ['provider', 'key'],
      },
    ],
  })
 
  User.hasMany(Cert, {
    foreignKey: 'uid',
  })
  
  const Session = db.define('session', {
    _id: DEF_ID,
    uid: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    gids: {
      type: Sequelize.ARRAY(Sequelize.TEXT),
      allowNull: false,
      defaultValue: [],
    },
    oids: {
      type: Sequelize.ARRAY(Sequelize.TEXT),
      allowNull: false,
      defaultValue: [],
    },
    provider: DEF_PROVIDER,
    isManager: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isAdmin: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    freezeTableName: true,
    indexes: [
      {fields: ['createdAt']},
    ],
  })
  
  User.hasMany(Session, {
    foreignKey: 'uid',
  })
  
  const Log = db.define('log', {
    _id: DEF_ID,
    level: {
      type: Sequelize.TEXT,
      allowNull: false,
      validate: {
        isIn: [Object.values(LOG_LEVEL)]
      },
      defaultValue: LOG_LEVEL.INFO,
    },
    sid: {
      type: Sequelize.TEXT,
    },
    rec: {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  }, {
    freezeTableName: true,
    timestamps: false,
    indexes: [
      {fields: ['createdAt']},
    ],
  })
  
  const Preference = db.define('preference', {
    pid: {
      type: Sequelize.TEXT,
      primaryKey: true,
      allowNull: false,
      validate: {
        isIn: [Object.values(PREFERENCE)],
      },
    },
    ver: DEF_VER,
    val: {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: '',
    },
  }, {
    freezeTableName: true,
  })

  await Group.sync()
  await User.sync()
  await SubGroup.sync()
  await Owner.sync()
  await Member.sync()
  await Cert.sync()
  await Session.sync()
  await Log.sync()
  await Preference.sync()
  
  return {db, Group, User, SubGroup, Cert, Session, Log, Preference}
}
