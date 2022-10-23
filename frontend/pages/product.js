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
import { strings } from '../lang/product';
import { strings as commonStrings } from '../lang/common';
import { strings as masterStrings } from '../lang/master';
import * as Helper from '../common/Helper';
import ProductService from '../services/ProductService';
import NoMatch from '../components/NoMatch';
import { useRouter } from 'next/router';
import CartService from '../services/CartService';

import styles from '../styles/product.module.css';

export default function Product({ _user, _signout, _noMatch, _product }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (_user) {
      setLoading(false);
    }
  }, [_user]);

  useEffect(() => {
    if (_signout) {
      UserService.signout(false);
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

  return (
    <>
      <Header user={_user} signout={_signout} />
      {
        ((_user && _user.verified) || !_user) &&
        <div className={styles.content}>
          {_product &&
            <>
              {/* TODO */}
              {_product._id}
            </>
          }

          {_noMatch && <NoMatch />}
        </div>
      }

      {
        _user && !_user.verified &&
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
  let _user = null, _signout = false, _noMatch = false, _product = null;

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
      } else {
        CartService.deleteCartId(context);
        _signout = true;
      }
    } else {
      _signout = true;
    }

    if (!_user || (_user && _user.verified)) {
      const { p: productId } = context.query;

      if (productId) {
        try {
          _product = await ProductService.getProduct(productId);

          if (!_product) {
            _noMatch = true;
          }
        } catch (err) {
          console.log(err);
          _noMatch = true;
        }
      } else {
        _noMatch = true;
      }
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
      _product
    }
  };
}
