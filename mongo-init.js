db = db.getSiblingDB('eden');

db.createUser({
  user: 'eden',
  pwd: 'eden',
  roles: [
    {
      role: 'readWrite',
      db: 'eden',
    },
  ],
});

db.createCollection('users');

const admin = db.users.insertMany([
 {
    userId: 'admin',
    isWallet: false,
    isAdmin: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);

db.createCollection('apikeys');

db.apikeys.insertMany([
  {
    user: admin.insertedIds[0],
    apiKey: 'admin',
    apiSecret: 'admin',
    deleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);

db.createCollection('generators');

const baseParameters = [
  {
    name: 'width',
    label: 'Width',
    description: 'Width of the creation in pixels',
    defaultValue: 512,
    minimum: 64, 
    maximum: 1280,
    step: 64,
  },
  {
    name: 'height',
    label: 'Height',
    description: 'Height of the creation in pixels',
    defaultValue: 512,
    minimum: 64, 
    maximum: 1280,
    step: 64,
  },
  {
    name: 'upscale_f',
    label: 'Upscale Factor',
    description: 'Diffusion-based upscaling factor',
    defaultValue: 1.0,
    allowedValues: [1.0, 2.0],
    optional: true,
  },
  {
    name: 'sampler',
    label: 'Sampler',
    description: 'Sampler to use for generation',
    defaultValue: 'klms',
    allowedValues: ['klms', 'dpm2', 'dpm2_ancestral', 'heun', 'euler', 'euler_ancestral', 'ddim', 'plms', 'dpm'],
    optional: true,
  },
  {
    name: 'steps',
    label: 'Steps',
    description: 'Number of sampling steps',
    defaultValue: 50,
    minimum: 5, 
    maximum: 200,
    optional: true,
  },
  {
    name: 'scale',
    label: 'Guidance scale',
    description: 'Guidance scale of prompt conditioning',
    defaultValue: 10.0,
    minimum: 0.0, 
    maximum: 20.0,
    step: 0.01,
    optional: true,
  },
  {
    name: 'stream',
    label: 'Stream',
    description: 'Yield intermediate results during creation process (if false, only final result is returned)',
    defaultValue: false,
    allowedValues: [true, false],
    optional: true,
  },
  {
    name: 'stream_every',
    label: 'Stream every',
    description: 'How often to yield intermediate results (when stream is true). In sampling steps for images, frames for video.',
    defaultValue: 1,
    minimum: 1,
    maximum: 25,
    optional: true,
  }
]

const animationParameters = [
  {
    name: 'n_frames',
    label: 'Frames',
    description: 'Number of frames in the video',
    defaultValue: 48,
    minimum: 2,
    maximum: 300,
  },
  {
    name: 'loop',
    label: 'Loop',
    description: 'Loop the output video',
    defaultValue: false,
    allowedValues: [true, false],
  },
  {
    name: 'smooth',
    label: 'Smooth',
    description: 'Optimize video for perceptual smoothness between frames (if false, frames are linearly spaced in prompt conditioning space)',
    defaultValue: true,
    allowedValues: [true, false],
    optional: true,
  },
  {
    name: 'n_film',
    label: 'FILM Iterations',
    description: 'How many iterations to apply FILM (film interpolation) to the generated frames',
    defaultValue: 0,
    allowedValues: [0, 1, 2],
    optional: true,
  },
  {
    name: 'fps',
    label: 'FPS',
    description: 'Frames per second of the output video',
    defaultValue: 12,
    minimum: 1,
    maximum: 30,
    optional: true,
  },
  {
    name: 'scale_modulation',
    label: 'Scale Modulation',
    description: 'How much to modulate the guidance scale of the prompt conditioning between frames',
    defaultValue: 0.0,
    minimum: 0.0,
    maximum: 0.5,
    step: 0.01,
    optional: true,
  },
  {
    name: 'latent_smoothing_std',
    label: 'Latent smoothing',
    description: 'How much to smooth the interpolated latent vectors before decoding to images (higher is smoother)',
    defaultValue: 0.01,
    minimum: 0.0,
    maximum: 0.1,
    step: 0.001,
    optional: true,
  },
]

const createParameters = [
  ...baseParameters,
  {
    name: 'text_input',
    label: 'Prompt',
    description: 'Text prompt for the creation',
    defaultValue: 'the quick brown fox jumps over the lazy dog',
    isRequired: true,
  },
  {
    name: 'uc_text',
    label: 'Negative prompt',
    description: 'Unconditional (negative) prompt',
    defaultValue: 'poorly drawn face, ugly, tiling, out of frame, extra limbs, disfigured, deformed body, blurry, blurred, watermark, text, grainy, signature, cut off, draft',
    optional: true,
  },
  {
    name: 'init_image_data',
    label: 'Init image',
    defaultValue: null,
    description: 'URL of image to initiate image before diffusion (if null, use random noise)',
    mediaUpload: true,
    optional: true,
  },
  {
    name: 'init_image_strength',
    label: 'Init image strength',
    description: 'How much to weight the initial image in the diffusion process',
    defaultValue: 0.0,
    minimum: 0.0,
    maximum: 1.0,
    step: 0.01,
    optional: true,
  },
  {
    name: 'mask_image_data',
    label: 'Mask image',
    defaultValue: null,
    description: 'URL of image to use as a mask for the diffusion process (if null, use no mask)',
    mediaUpload: true,
    optional: true,
  },
  {
    name: 'mask_brightness_adjust',
    label: 'Mask brightness',
    defaultValue: 1.0,
    minimum: 0.1,
    maximum: 2.0,
    step: 0.01,
    description: 'How much to adjust the brightness of the mask image',
    optional: true,
  },
  {
    name: 'mask_contrast_adjust',
    label: 'Mask contrast',
    description: 'How much to adjust the contrast of the mask image',
    defaultValue: 1.0,
    minimum: 0.1,
    maximum: 2.0,
    step: 0.01,
    optional: true,
  },
  {
    name: 'mask_invert',
    label: 'Invert Mask',
    description: 'Invert the mask image',
    defaultValue: false,
    optional: true,
  },
  {
    name: 'n_samples',
    label: 'Samples',
    description: 'Number of samples to create.',
    defaultValue: 1,
    allowedValues: [1, 2, 4],
    optional: true,
  },
  {
    name: 'seed',
    label: 'Seed',
    description: 'Set random seed for reproducibility. If blank, will be set randomly.',
    defaultValue: null,
    minimum: 0,
    maximum: 1e8,
    optional: true,
  }
]

const interpolationParameters = [
  ...baseParameters,
  ...animationParameters,
  {
    name: 'interpolation_texts',
    label: 'Prompts',
    description: 'Prompts to interpolate through',
    defaultValue: [],
    minLength: 2,
    isRequired: true,
  },
  {
    name: 'interpolation_seeds',
    label: 'Seeds',
    description: 'Random seeds. Must have 1 for each prompt. If left blank, will be set randomly.',
    defaultValue: [],
    optional: true,
  }
]

const real2realParameters = [
  ...baseParameters,
  ...animationParameters,
  {
    name: 'interpolation_init_images',
    label: 'Real images',
    description: 'URLs of images to use as init images for real2real',
    defaultValue: [],
    mediaUpload: true,
    minLength: 2,
    isRequired: true,
  },
  {
    name: 'interpolation_init_images_top_k',
    label: 'Top K img2txt',
    description: 'Average conditioning vectors of top k img2txt prompts from clip-interrogator',
    defaultValue: 2,
    allowedValues: [1, 2, 3, 4, 5],
    optional: true,
  },
  {
    name: 'interpolation_init_images_power',
    label: 'Init image power',
    description: 'Power of the init_img_strength curve (how fast init_strength declines at endpoints)',
    defaultValue: 3.0,
    minimum: 1.0,
    maximum: 5.0,
    step: 0.01,
    optional: true,
  },
  {
    name: 'interpolation_init_images_min_strength',
    label: 'Init image min strength',
    description: 'Minimum strength of the init_img during interpolation',
    defaultValue: 0.2,
    minimum: 0.0,
    maximum: 0.5,
    step: 0.01,
    optional: true,
  },
  {
    name: 'interpolation_init_images_max_strength',
    label: 'Init image max strength',
    description: 'Maximum strength of the init_img during interpolation',
    defaultValue: 0.95,
    minimum: 0.5,
    maximum: 1.0,
    step: 0.01,
    optional: true,
  },
  {
    name: 'interpolation_seeds',
    label: 'Interpolation seeds',
    description: 'Random seeds. Must have 1 for each init image. If left blank, will be set randomly.',
    defaultValue: [],
    optional: true,
  }
]

const remixParameters = [
  ...baseParameters,
  {
    name: 'text_input',
    label: 'Prompt',
    description: 'Text prompt for the creation',
    defaultValue: 'the quick brown fox jumps over the lazy dog',
    isRequired: true,
  },
  {
    name: 'init_image_data',
    label: 'Init image',
    description: 'URL of image to initiate image before diffusion (if null, use random noise)',
    defaultValue: null,
    mediaUpload: true,
    isRequired: true,
  },
  {
    name: 'init_image_strength',
    label: 'Init image strength',
    description: 'How much to weight the initial image in the diffusion process',
    defaultValue: 0.0,
    minimum: 0.0,
    maximum: 1.0,
    step: 0.01,
  },
  {
    name: 'n_samples',
    label: 'Samples',
    description: 'Number of samples to create remix',
    defaultValue: 1,
    allowedValues: [1, 2, 4],
    optional: true,
  },
  {
    name: 'uc_text',
    label: 'Negative prompt',
    description: 'Unconditional (negative) prompt',
    defaultValue: 'poorly drawn face, ugly, tiling, out of frame, extra limbs, disfigured, deformed body, blurry, blurred, watermark, text, grainy, signature, cut off, draft',
    optional: true,
  },
  {
    name: 'seed',
    label: 'Seed',
    description: 'Set random seed for reproducibility. If blank, will be set randomly.',
    defaultValue: 0,
    minimum: 0,
    maximum: 1e8,
    optional: true,
  }
]

// Register generators
const createGeneratorVersion = {
  versionId: 'latest',
  defaultParameters: createParameters,
  isDeprecated: false,
}

const createGenerator = {
  generatorName: 'create',
  versions: [createGeneratorVersion],
}

const interpolateGeneratorVersion = {
  versionId: 'latest',
  defaultParameters: interpolationParameters,
  isDeprecated: false,
}

const interpolateGenerator = {
  generatorName: 'interpolate',
  versions: [interpolateGeneratorVersion],
}

const real2realGeneratorVersion = {
  versionId: 'latest',
  defaultParameters: real2realParameters,
  isDeprecated: false
}

const real2realGenerator = {
  generatorName: 'real2real',
  versions: [real2realGeneratorVersion]
}

const remixGeneratorVersion = {
  versionId: 'latest',
  defaultParameters: remixParameters,
  isDeprecated: false
}

const remixGenerator = {
  generatorName: 'remix',
  versions: [remixGeneratorVersion]
}

db.generators.insertMany([
  createGenerator,
  interpolateGenerator,
  real2realGenerator,
  remixGenerator
]);