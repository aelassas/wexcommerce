import { useEffect, useState } from 'react';
import UserService from '../services/UserService';
import Header from '../components/Header';
import {
  Input,
  InputLabel,
  FormControl,
  FormHelperText,
  Button,
  Paper
} from '@mui/material';
import { strings } from '../lang/update-order';
import { strings as commonStrings } from '../lang/common';
import { strings as masterStrings } from '../lang/master';
import * as Helper from '../common/Helper';
import OrderService from '../services/OrderService';
import NoMatch from '../components/NoMatch';
import { useRouter } from 'next/router';

import styles from '../styles/update-order.module.css';

export default function UpdateOrder({ _user, _signout, _noMatch, _order }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

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
    Helper.setLanguage(strings);
    Helper.setLanguage(commonStrings);
    Helper.setLanguage(masterStrings);
  }, []);

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
      // TODO
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
          {_order &&
            <Paper className={styles.form} elevation={10}>
              <h1 className={styles.formTitle}> {strings.UPDATE_ORDER_HEADING} </h1>
              <form onSubmit={handleSubmit}>

                {/* TODO: form controls (FormControl) */}

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
                      router.replace('/');
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
  let _user = null, _signout = false, _noMatch = false, _order = null;

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
          const { o: orderId } = context.query;
          if (orderId) {
            try {
              _order = await OrderService.getOrder(context, orderId);

              if (!_order) {
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
      _order
    }
  };
}
