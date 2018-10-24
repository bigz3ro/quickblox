var user = {
      id: 4448514,
      name: 'chatuserweb1',
      login: 'chatuserweb1',
      pass: 'chatuserweb1'
    };

QB.createSession({login: user.login, password: user.pass}, function(err, res) {
  if (res) {
    QB.chat.connect({userId: user.id, password: user.pass}, function(err, roster) {
      if (err) {
          console.log(err);
      } else {


       // *  (Object) roster - The user contact list
       // *  roster = {
       // *    '1126541': {subscription: 'both', ask: null},        // you and user with ID 1126541 subscribed to each other.
       // *    '1126542': {subscription: 'none', ask: null},        // you don't have subscription but user maybe has
       // *    '1126543': {subscription: 'none', ask: 'subscribe'}, // you haven't had subscription earlier but now you asked for it
       // *  };


      }
    });
  }else{
    console.log(err);
  }
});

function Login() {
  this.isLoginPageRendered = false;
  this.isLogin = false;
}

Login.prototype.init = function () {
  var self = this;
  return new Promise(function (resolve, reject) {
      var user = localStorage.getItem('user');
      if (user && !app.user) {
        app.room = saveUser.tag_list;
        self.login(saveUser)
            .then(function () {
              resolve(true);
            }).catch(function (error){
              reject(error);
            });
      } else {
        resolve(false);
      }
  });
}
Login.prototype.login = function (user) {
    var self = this;
    return new Promise(function(resolve, reject) {
        if(self.isLoginPageRendered){
            document.forms.loginForm.login_submit.innerText = 'loading...';
        } else {
            self.renderLoadingPage();
        }
        QB.createSession(function(csErr, csRes) {
            var userRequiredParams = {
                'login':user.login,
                'password': user.password
            };
            if (csErr) {
                loginError(csErr);
            } else {
                app.token = csRes.token;
                QB.login(userRequiredParams, function(loginErr, loginUser){
                    if(loginErr) {
                        /** Login failed, trying to create account */
                        QB.users.create(user, function (createErr, createUser) {
                            if (createErr) {
                                loginError(createErr);
                            } else {
                                QB.login(userRequiredParams, function (reloginErr, reloginUser) {
                                    if (reloginErr) {
                                        loginError(reloginErr);
                                    } else {
                                        loginSuccess(reloginUser);
                                    }
                                });
                            }
                        });
                    } else {
                        /** Update info */
                        if(loginUser.user_tags !== user.tag_list || loginUser.full_name !== user.full_name) {
                            QB.users.update(loginUser.id, {
                                'full_name': user.full_name,
                                'tag_list': user.tag_list
                            }, function(updateError, updateUser) {
                                if(updateError) {
                                    loginError(updateError);
                                } else {
                                    loginSuccess(updateUser);
                                }
                            });
                        } else {
                            loginSuccess(loginUser);
                        }
                    }
                });
            }
        });

        function loginSuccess(userData){
            app.user = userModule.addToCache(userData);
            app.user.user_tags = userData.user_tags;
            QB.chat.connect({userId: app.user.id, password: user.password}, function(err, roster){
                if (err) {
                    document.querySelector('.j-login__button').innerText = 'Login';
                    console.error(err);
                    reject(err);
                } else {
                    self.isLogin = true;
                    resolve();
                }
            });
        }

        function loginError(error){
            self.renderLoginPage();
            console.error(error);
            alert(error + "\n" + error.detail);
            reject(error);
        }
    });

};

