import { useEffect, useState } from 'react';
import UserService from '../services/UserService';
import Header from '../components/Header';
import { strings } from '../lang/settings';
import { strings as commonStrings } from '../lang/common';
import { strings as masterStrings } from '../lang/master';
import { strings as headerStrings } from '../lang/header';
import * as Helper from '../common/Helper';
import { useRouter } from 'next/router';
import {
  Input,
  InputLabel,
  FormControl,
  FormHelperText,
  Button,
  Paper
} from '@mui/material';
import validator from 'validator';

import styles from '../styles/settings.module.css';

export default function Settings({ _user, _signout }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneValid, setPhoneValid] = useState(true);
  const [address, setAddress] = useState('');

  useEffect(() => {
    Helper.setLanguage(strings);
    Helper.setLanguage(commonStrings);
    Helper.setLanguage(masterStrings);
    Helper.setLanguage(headerStrings);
  }, []);

  useEffect(() => {
    if (_user) {
      setLoading(false);
      setFullName(_user.fullName);
      setPhone(_user.phone || '');
      setAddress(_user.address || '');
    }
  }, [_user]);

  useEffect(() => {
    if (_signout) {
      UserService.signout(false, true);
    }
  }, [_signout]);

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

  const validatePhone = (phone) => {
    if (phone) {
      const phoneValid = validator.isMobilePhone(phone);
      setPhoneValid(phoneValid);

      return phoneValid;
    } else {
      setPhoneValid(true);

      return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const phoneValid = await validatePhone(phone);
      if (!phoneValid) {
        return;
      }

      const payload = { _id: _user._id, fullName, phone, address };
      const status = await UserService.updateUser(payload);

      if (status === 200) {
        Helper.info(commonStrings.UPDATED);
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
        <div className={'content'}>
          <Paper className={styles.form} elevation={10}>
            <form onSubmit={handleSubmit}>
              <h1 className={styles.formTitle}>{headerStrings.SETTINGS}</h1>
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
                  value={_user.email}
                  disabled
                  autoComplete="off"
                />
              </FormControl>

              <FormControl fullWidth margin="dense">
                <InputLabel className='required'>{commonStrings.PHONE}</InputLabel>
                <Input
                  type="text"
                  label={commonStrings.PHONE}
                  error={!phoneValid}
                  value={phone}
                  onBlur={(e) => {
                    validatePhone(e.target.value);
                  }}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setPhoneValid(true);
                  }}
                  required
                  autoComplete="off"
                />
                <FormHelperText error={!phoneValid}>
                  {(!phoneValid && commonStrings.PHONE_NOT_VALID) || ''}
                </FormHelperText>
              </FormControl>

              <FormControl fullWidth margin="dense">
                <InputLabel className='required'>{commonStrings.ADDRESS}</InputLabel>
                <Input
                  type="text"
                  onChange={(e) => {
                    setAddress(e.target.value);
                  }}
                  required
                  multiline
                  minRows={5}
                  value={address}
                />
              </FormControl>

              <div className="buttons">
                <Button
                  variant="contained"
                  className='btn-primary btn-margin-bottom'
                  size="small"
                  onClick={() => {
                    router.replace('/change-password')
                  }}
                >
                  {strings.CHANGE_PASSWORD}
                </Button>
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
  let _user = null, _signout = false;

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

        if (!_user) {
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
    }
  };

}
