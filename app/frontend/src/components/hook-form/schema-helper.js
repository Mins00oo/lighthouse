import dayjs from 'dayjs';
import { z as zod } from 'zod';

// ----------------------------------------------------------------------

export const schemaHelper = {
  /**
   * Phone number
   * Apply for phone number input.
   */
  phoneNumber: (props) =>
    zod
      .string({
        required_error: props?.message?.required ?? '전화번호를 입력해주세요.',
        invalid_type_error: props?.message?.invalid_type ?? '올바른 전화번호 형식이 아닙니다.',
      })
      .min(1, { message: props?.message?.required ?? '전화번호를 입력해주세요.' })
      .refine((data) => props?.isValid?.(data), {
        message: props?.message?.invalid_type ?? '올바른 전화번호 형식이 아닙니다.',
      }),
  /**
   * Date
   * Apply for date pickers.
   */
  date: (props) =>
    zod.coerce
      .date()
      .nullable()
      .transform((dateString, ctx) => {
        const date = dayjs(dateString).format();

        const stringToDate = zod.string().pipe(zod.coerce.date());

        if (!dateString) {
          ctx.addIssue({
            code: zod.ZodIssueCode.custom,
            message: props?.message?.required ?? '날짜를 선택해주세요.',
          });
          return null;
        }

        if (!stringToDate.safeParse(date).success) {
          ctx.addIssue({
            code: zod.ZodIssueCode.invalid_date,
            message: props?.message?.invalid_type ?? '올바른 날짜 형식이 아닙니다.',
          });
        }

        return date;
      })
      .pipe(zod.union([zod.number(), zod.string(), zod.date(), zod.null()])),
  /**
   * Editor
   * defaultValue === '' | <p></p>
   * Apply for editor
   */
  editor: (props) =>
    zod.string().min(8, { message: props?.message ?? '내용을 입력해주세요.' }),
  /**
   * Nullable Input
   * Apply for input, select... with null value.
   */
  nullableInput: (schema, options) =>
    schema.nullable().transform((val, ctx) => {
      if (val === null || val === undefined) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          message: options?.message ?? '필수 입력 항목입니다.',
        });
        return val;
      }
      return val;
    }),
  /**
   * Boolean
   * Apply for checkbox, switch...
   */
  boolean: (props) =>
    zod.boolean({ coerce: true }).refine((val) => val === true, {
      message: props?.message ?? '필수 선택 항목입니다.',
    }),
  /**
   * Slider
   * Apply for slider with range [min, max].
   */
  sliderRange: (props) =>
    zod
      .number()
      .array()
      .refine((data) => data[0] >= props?.min && data[1] <= props?.max, {
        message: props.message ?? `${props?.min}에서 ${props?.max} 사이의 값이어야 합니다.`,
      }),
  /**
   * File
   * Apply for upload single file.
   */
  file: (props) =>
    zod.custom().transform((data, ctx) => {
      const hasFile = data instanceof File || (typeof data === 'string' && !!data.length);

      if (!hasFile) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          message: props?.message ?? '파일을 선택해주세요.',
        });
        return null;
      }

      return data;
    }),
  /**
   * Files
   * Apply for upload multiple files.
   */
  files: (props) =>
    zod.array(zod.custom()).transform((data, ctx) => {
      const minFiles = props?.minFiles ?? 2;

      if (!data.length) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          message: props?.message ?? '파일을 선택해주세요.',
        });
      } else if (data.length < minFiles) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          message: `최소 ${minFiles}개 이상의 파일이 필요합니다.`,
        });
      }

      return data;
    }),
};
