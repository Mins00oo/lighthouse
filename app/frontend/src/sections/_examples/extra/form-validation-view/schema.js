import { z as zod } from 'zod';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import { fIsAfter } from 'src/utils/format-time';

import { schemaHelper } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export const FieldsSchema = zod
  .object({
    fullName: zod
      .string()
      .min(1, { message: '이름을 입력해주세요.' })
      .min(6, { message: '최소 6자 이상이어야 합니다.' })
      .max(32, { message: '최대 32자까지 입력 가능합니다.' }),
    email: zod
      .string()
      .min(1, { message: '이메일을 입력해주세요.' })
      .email({ message: '올바른 이메일 형식이 아닙니다.' }),
    age: schemaHelper.nullableInput(
      zod
        .number({ coerce: true })
        .int()
        .min(1, { message: '나이를 입력해주세요.' })
        .max(80, { message: 'Age must be between 1 and 80' }),
      // message for null value
      { message: '나이를 입력해주세요.' }
    ),
    price: schemaHelper.nullableInput(
      // handle null value and undefined value
      zod.number({ coerce: true }).min(1, { message: '가격을 입력해주세요.' }).optional(),
      // message for null value
      { message: '가격을 입력해주세요.' }
    ),
    quantity: schemaHelper.nullableInput(
      zod
        .number({ coerce: true })
        .min(1, { message: '수량을 입력해주세요.' })
        .max(99, { message: 'Quantity must be between 1 and 99' }),
      // message for null value
      { message: '수량을 입력해주세요.' }
    ),
    // phone
    phoneNumber: schemaHelper.phoneNumber({ isValid: isValidPhoneNumber }),
    // code
    code: zod
      .string()
      .min(1, { message: '인증 코드를 입력해주세요.' })
      .min(6, { message: '인증 코드는 최소 6자 이상이어야 합니다.' }),
    // date
    startDate: schemaHelper.date({ message: { required: '시작일을 선택해주세요.' } }),
    endDate: schemaHelper.date({ message: { required: '종료일을 선택해주세요.' } }),
    // password
    password: zod
      .string()
      .min(1, { message: '비밀번호를 입력해주세요.' })
      .min(6, { message: '비밀번호가 너무 짧습니다.' }),
    confirmPassword: zod.string().min(1, { message: '비밀번호 확인을 입력해주세요.' }),
    // autocomplete
    autocomplete: schemaHelper.nullableInput(zod.custom(), {
      message: '자동완성 항목을 선택해주세요.',
    }),
    // country
    singleCountry: zod.string().min(1, { message: '국가를 선택해주세요.' }),
    multiCountry: zod.string().array().min(2, { message: '최소 2개 이상 입력해주세요.' }),
    // select
    singleSelect: zod.string().min(1, { message: '항목을 선택해주세요.' }),
    multiSelect: zod.string().array().min(2, { message: '최소 2개 이상 입력해주세요.' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  })
  .refine((data) => !fIsAfter(data.startDate, data.endDate), {
    message: '종료일은 시작일 이후여야 합니다.',
    path: ['endDate'],
  });

// ----------------------------------------------------------------------

export const ControlsSchema = zod.object({
  // rating
  rating: zod.number().min(1, { message: '평점을 입력해주세요.' }),
  // radio
  radioGroup: zod.string().min(1, { message: '하나 이상 선택해주세요.' }),
  // checkbox
  checkbox: schemaHelper.boolean({ message: '필수 체크 항목입니다.' }),
  multiCheckbox: zod.string().array().min(1, { message: '하나 이상 선택해주세요.' }),
  // switch
  switch: schemaHelper.boolean({ message: '필수 선택 항목입니다.' }),
  multiSwitch: zod.string().array().min(1, { message: '하나 이상 선택해주세요.' }),
  // slider
  slider: zod.number().min(10, { message: 'Mininum value is >= 10' }),
  sliderRange: schemaHelper.sliderRange({
    min: 20,
    max: 80,
  }),
});

// ----------------------------------------------------------------------

export const OtherSchema = zod.object({
  editor: schemaHelper
    .editor()
    .min(100, { message: 'Content must be at least 100 characters' })
    .max(500, { message: 'Content must be less than 500 characters' }),
  singleUpload: schemaHelper.file({ message: '파일을 업로드해주세요.' }),
  multiUpload: schemaHelper.files({ message: '파일을 업로드해주세요.' }),
});
