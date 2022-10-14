import { useEffect, useRef, useState } from 'react';
import UserService from '../services/UserService';
import Header from '../components/Header';
import {
  Input,
  InputLabel,
  FormControl,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { PhotoCamera as ImageIcon } from '@mui/icons-material';
import { strings } from '../lang/video';
import { strings as homeStrings } from '../lang/home';
import { strings as commonStrings } from '../lang/common';
import { strings as masterStrings } from '../lang/master';
import * as Helper from '../common/Helper';
import Env from '../config/env.config';
import VideoService from '../services/VideoService';
import NoMatch from '../components/NoMatch';
import CategorySelectList from '../components/CategorySelectList';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { fr, enUS } from "date-fns/locale";

import styles from '../styles/video.module.css';

export default function Video({ _user, _signout, _noMatch, _video, _videoFile }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [categories, setCategories] = useState([]);
  const [description, setDescription] = useState('');
  const [tempImage, setTempImage] = useState('');
  const [play, setPlay] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const upload = useRef(null);
  const playerRef = useRef(null);

  const videoJsOptions = {
    language: UserService.getLanguage(),
    controls: true,
    controlBar: { pictureInPictureToggle: false }
  };
  const _format = 'd LLL yyyy';
  const _locale = UserService.getLanguage() === 'en' ? enUS : fr;

  useEffect(() => {
    Helper.setLanguage(strings);
    Helper.setLanguage(homeStrings);
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
    if (_video) {
      setName(_video.name);
      setCategories(_video.categories);
      setDescription(_video.description);
    }
  }, [_video]);

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

  const handlePlayerReady = (player) => {
    playerRef.current = player;
  };

  const handleChangeImage = (e) => {
    const reader = new FileReader();
    const file = e.target.files[0];

    reader.onloadend = async () => {
      try {
        const filename = await VideoService.uploadImage(file);
        setTempImage(filename);
        if (playerRef.current) {
          playerRef.current.pause();
          playerRef.current.currentTime(0)
          playerRef.current.trigger('loadstart');
        }
        setPlay(false);
      } catch (err) {
        Helper.error();
      }
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const _categories = categories.map(c => c._id);
      const data = { _id: _video._id, name, description, categories: _categories };
      if (tempImage) data.image = tempImage;
      const res = await VideoService.updateVideo(data);

      if (res.status === 200) {
        setTempImage('');
        _video.image = res.data.image;
        Helper.info(strings.VIDEO_UPDATED);
      } else {
        Helper.error();
      }
    } catch (err) {
      Helper.error();
    }
  };

  return (
    !loading && _user &&
    <>
      <Header user={_user} />
      {
        _user.verified &&
        <div className={styles.content}>
          {_video && _videoFile &&
            <div className={styles.container}>
              <div className={styles.video}>
                <div className={styles.player}>

                  {
                    !play &&
                    <div className={styles.playerCover}
                      style={{ backgroundImage: `url(${Helper.joinURL(tempImage ? Env.CDN_TEMP_IMAGES : Env.CDN_IMAGES, tempImage || _video.image)})` }}
                      onClick={() => {
                        if (playerRef.current) {
                          setPlay(true);
                          playerRef.current.src(Helper.joinURL(Env.CDN_VIDEOS, _videoFile));
                          playerRef.current.ready(() => {
                            playerRef.current.play();
                          });
                        }
                      }}
                    >
                    </div>
                  }

                </div>

                <div className={styles.videoStats}>
                  <span className={styles.views}>{`${_video.views} ${_video.views === 1 ? homeStrings.VIEW : homeStrings.VIEWS}`}</span>
                  <span>{format(new Date(_video.createdAt), _format, { locale: _locale })}</span>
                </div>

                <form onSubmit={handleSubmit} className={styles.videoForm}>
                  <FormControl fullWidth margin="dense">
                    <InputLabel className='required'>{strings.NAME}</InputLabel>
                    <Input
                      type="text"
                      value={name}
                      required
                      onChange={(e) => {
                        setName(e.target.value);
                      }}
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormControl fullWidth margin="dense">
                    <CategorySelectList
                      label={strings.CATEGORIES}
                      required
                      multiple
                      variant='standard'
                      selectedOptions={categories}
                      onChange={(values) => {
                        setCategories(values);
                      }}
                    />
                  </FormControl>
                  <FormControl fullWidth margin="dense">
                    <InputLabel className='required'>{strings.DESCRIPTION}</InputLabel>
                    <Input
                      type="text"
                      value={description}
                      required
                      onChange={(e) => {
                        setDescription(e.target.value);
                      }}
                      autoComplete="off"
                      multiline
                      minRows={5}
                    />
                  </FormControl>
                  <FormControl fullWidth margin="dense" className={styles.imageControl}>
                    <a onClick={(e) => {
                      if (upload.current) {
                        upload.current.value = '';

                        setTimeout(() => {
                          upload.current.click(e);
                        }, 0);
                      }
                    }}
                      className={styles.action}
                    >
                      <ImageIcon className={styles.icon} />
                      <span>{strings.UPDATE_IMAGE}</span>
                    </a>
                    <input ref={upload} type="file" accept="image/*" hidden onChange={handleChangeImage} />
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
                      className='btn-margin-bottom'
                      color='error'
                      size="small"
                      onClick={() => {
                        setOpenDeleteDialog(true);
                      }}
                    >
                      {commonStrings.DELETE}
                    </Button>
                    <Button
                      variant="contained"
                      className='btn-secondary btn-margin-bottom'
                      size="small"
                      onClick={async () => {
                        try {
                          if (tempImage) {
                            const status = await VideoService.deleteTempImage(tempImage);
                            if (status !== 200) {
                              Helper.error();
                            }
                          }
                          router.replace('/');
                        } catch (err) {
                          Helper.error();
                        }
                      }}
                    >
                      {commonStrings.CANCEL}
                    </Button>
                  </div>
                </form>
              </div>

              <Dialog
                disableEscapeKeyDown
                maxWidth="xs"
                open={openDeleteDialog}
              >
                <DialogTitle className='dialog-header'>{commonStrings.CONFIRM_TITLE}</DialogTitle>
                <DialogContent>{strings.DELETE_VIDEO}</DialogContent>
                <DialogActions className='dialog-actions'>
                  <Button onClick={() => {
                    setOpenDeleteDialog(false);
                  }} variant='contained' className='btn-secondary'>{commonStrings.CANCEL}</Button>
                  <Button onClick={async () => {
                    try {
                      const status = await VideoService.deleteVideo(_video._id);
                      if (status === 200) {
                        if (tempImage) {
                          const status = await VideoService.deleteTempImage(tempImage);
                          if (status !== 200) {
                            Helper.error();
                          }
                        }
                        router.replace('/');
                      }
                    } catch (err) {
                      Helper.error();
                    }
                  }} variant='contained' color='error'>{commonStrings.DELETE}</Button>
                </DialogActions>
              </Dialog>
            </div>
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
  let _user = null, _signout = false, _noMatch = false, _video = null, _videoFile = '';

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
          const { v: videoId } = context.query;
          if (videoId) {
            try {
              const language = UserService.getLanguage(context);
              _video = await VideoService.getVideo(videoId, language);

              if (!_video) {
                _noMatch = true;
              } else {
                const res = await VideoService.getVideoFile(context, currentUser.id, videoId);

                if (res.status === 200 && res.data) {
                  _videoFile = res.data;
                }
                else {
                  _noMatch = true;
                }
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
      _video,
      _videoFile
    }
  };
}
