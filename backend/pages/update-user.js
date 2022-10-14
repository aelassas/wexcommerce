import { useEffect, useState } from 'react';
import UserService from '../services/UserService';
import SubscriptionService from '../services/SubscriptionService';
import Header from '../components/Header';
import {
  Input,
  InputLabel,
  FormControl,
  Button,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel
} from '@mui/material';
import { strings } from '../lang/update-user';
import { strings as commonStrings } from '../lang/common';
import { strings as masterStrings } from '../lang/master';
import * as Helper from '../common/Helper';
import NoMatch from '../components/NoMatch';
import { useRouter } from 'next/router';

import styles from '../styles/update-user.module.css';

export default function UpdateUser({ _user, _signout, _noMatch, __user, _subscriptions }) {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [subscription, setSubscription] = useState('');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Helper.setLanguage(strings);
    Helper.setLanguage(commonStrings);
    Helper.setLanguage(masterStrings);
  }, []);

  useEffect(() => {
    if (_user) {
      setLoading(false);
    }
  }, [_user]);

  useEffect(() => {
    if (_signout) {
      UserService.signout();
    }
  }, [_signout]);

  useEffect(() => {
    if (__user) {
      setFullName(__user.fullName);
      setSubscription(__user.subscription);
    }
  }, [__user]);

  const handleResend = async (e) => {
    try {
      e.preventDefault();
      const data = { email: _user.email };

      const status = await UserService.resendLink(data);

      if (status === 200) {
        Helper.info(masterStrings.VALIDATION_EMAIL_SENT);
      } else {
        Helper.error(masterStrings.VALIDATION_EMAIL_ERROR);
      }

    } catch (err) {
      Helper.error(masterStrings.VALIDATION_EMAIL_ERROR);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = { _id: __user._id, fullName, subscription: subscription === '0' ? null : subscription };
      const status = await UserService.updateUser(payload);

      if (status === 200) {
        Helper.info(strings.USER_UPDATED);
      } else {
        Helper.error();
      }
    }
    catch (err) {
      UserService.signout();
    }
  };

  return (
    !loading && _user &&
    <>
      <Header user={_user} />
      {
        _user.verified &&
        <div className={styles.content}>
          {__user &&
            <Paper className={styles.form} elevation={10}>
              <form onSubmit={handleSubmit}>
                <h1 className={styles.formTitle}> {strings.UPDATE_USER_HEADING} </h1>
                <FormControl fullWidth margin="dense">
                  <InputLabel className='required'>{commonStrings.FULL_NAME}</InputLabel>
                  <Input
                    type="text"
                    value={fullName}
                    required
                    onChange={(e) => {
                      setFullName(e.target.value);
                    }}
                    autoComplete="off"
                  />
                </FormControl>

                <FormControl fullWidth margin="dense">
                  <InputLabel className='required'>{commonStrings.EMAIL}</InputLabel>
                  <Input
                    type="text"
                    value={__user.email}
                    disabled
                    autoComplete="off"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel className='required'>{commonStrings.SUBSCRIPTION}</FormLabel >
                  <RadioGroup
                    value={subscription || '0'}
                    onChange={(event) => {
                      if (event.target.value === '0') {
                        setSubscription('0');
                      } else {
                        const sub = _subscriptions.filter(s => s._id === event.target.value)[0];
                        setSubscription(sub._id);
                      }
                    }}
                  >
                    {
                      _subscriptions.map((sub) => (
                        <FormControlLabel key={sub._id} value={sub._id} control={<Radio />} label={
                          <span className={styles.subscription}>
                            <span className={styles.subscriptionName}>{`${sub.name} (${sub.price} ${commonStrings.CURRENCY_PER_MONTH})`}</span>
                          </span>
                        } />
                      ))
                    }

                    <FormControlLabel key={'0'} value={'0'} control={<Radio />} label={
                      <span className={styles.subscription}>
                        <span className={styles.subscriptionName}>{commonStrings.NO_SUBSCRIPTION}</span>
                      </span>
                    } />
                  </RadioGroup>
                </FormControl>

                <div className="buttons">
                  <Button
                    type="submit"
                    variant="contained"
                    className='btn-primary btn-margin-bottom'
                    size="small"
                  >
                    {commonStrings.SAVE}
                  </Button>
                  <Button
                    variant="contained"
                    className='btn-secondary btn-margin-bottom'
                    size="small"
                    onClick={() => {
                      router.replace('/users');
                    }}
                  >
                    {commonStrings.CANCEL}
                  </Button>
                </div>
              </form>

            </Paper>
          }

          {_noMatch && <NoMatch />}
        </div>
      }

      {
        !_user.verified &&
        <div className="validate-email">
          <span>{masterStrings.VALIDATE_EMAIL}</span>
          <Button
            type="button"
            variant="contained"
            size="small"
            className="btn-primary btn-resend"
            onClick={handleResend}
          >{masterStrings.RESEND}</Button>
        </div>
      }
    </>
  );
};

export async function getServerSideProps(context) {
  let _user = null, _signout = false, _noMatch = false, __user = null, _subscriptions = [];

  try {
    const currentUser = UserService.getCurrentUser(context);

    if (currentUser) {
      let status;
      try {
        status = await UserService.validateAccessToken(context);
      } catch (err) {
        console.log('Unauthorized!');
      }

      if (status === 200) {
        _user = await UserService.getUser(context, currentUser.id);

        if (_user) {
          const { u: userId } = context.query;
          if (userId) {
            try {
              __user = await UserService.getUser(context, userId);

              if (__user) {
                const language = UserService.getLanguage(context);
                _subscriptions = await SubscriptionService.getSubscriptions(language);
              } else {
                _noMatch = true;
              }
            } catch (err) {
              console.log(err);
              _noMatch = true;
            }
          } else {
            _noMatch = true;
          }
        } else {
          _signout = true;
        }
      } else {
        _signout = true;
      }

    } else {
      _signout = true;
    }
  } catch (err) {
    console.log(err);
    _signout = true;
  }

  return {
    props: {
      _user,
      _signout,
      _noMatch,
      __user,
      _subscriptions
    }
  };
}
