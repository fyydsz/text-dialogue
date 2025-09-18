interface SpeakerProfile {
  name: string;
  soundSrc: string;
  avatars?: { [key: string]: string };
}

export const SPEAKER_PROFILES: { [key: string]: SpeakerProfile } = {
  narrator: {
    name: "none",
    soundSrc: "/music/snd_txtsus.wav",
  },
  sans: {
    name: "sans",
    soundSrc: "/music/snd_txtsans.wav",
    avatars: {
      sansnormal: "/img/sans/spr_face_sans0_0.png",
      sansrelaxed: "/img/sans/spr_face_sans1_0.png",
      sansclosed: "/img/sans/spr_face_sans2_0.png",
      sanslookright: "/img/sans/spr_face_sans3_0.png",
      sanslookleft: "/img/sans/spr_face_sans4_0.png",
      sanswink: "/img/sans/spr_face_sans5_0.png"
    }
  },
  ralsei: {
    name: "ralsei",
    soundSrc: "/music/snd_txtral.wav",
    avatars: {
      ralseismile: "/img/ralsei/spr_face_r_dark_0.png",
      ralseishy: "/img/ralsei/spr_face_r_dark_1.png",
      ralseishyblush: "/img/ralsei/spr_face_r_dark_2.png",
      ralseilooking: "/img/ralsei/spr_face_r_dark_3.png",
      ralseisad: "/img/ralsei/spr_face_r_dark_4.png",
      ralseihappy: "/img/ralsei/spr_face_r_dark_5.png",
      ralseismile2: "/img/ralsei/spr_face_r_dark_6.png",
      ralseismile2blush: "/img/ralsei/spr_face_r_dark_7.png",
      ralseijoy: "/img/ralsei/spr_face_r_dark_8.png",
      ralseinohat: "/img/ralsei/spr_face_r_dark_9.png",
      ralseiangry: "/img/ralsei/spr_face_r_dark_10.png",
      ralseiserious: "/img/ralsei/spr_face_r_dark_11.png",
      ralseiconcerned: "/img/ralsei/spr_face_r_dark_12.png"
    }
  }
};

export const DEFAULT_SPEAKER = SPEAKER_PROFILES.narrator;