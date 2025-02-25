import { describe, it, expect } from 'vitest';
import { fizzbuzz } from './';

describe('fizzbuzz', () => {
  // it('should return the number if it is not divisible by 3 or 5', () => {
  //   expect(fizzbuzz(1)).toBe(1);
  //   expect(fizzbuzz(2)).toBe(2);
  //   expect(fizzbuzz(4)).toBe(4);
  // });

  it('should return "fizz" if the number is divisible by 3', () => {
    expect(fizzbuzz(6)).toBe('fizz');
    expect(fizzbuzz(9)).toBe('fizz');
  });

  // it('should return "buzz" if the number is divisible by 5', () => {
  //   expect(fizzbuzz(5)).toBe('buzz');
  //   expect(fizzbuzz(10)).toBe('buzz');
  //   expect(fizzbuzz(20)).toBe('buzz');
  // });
  //
  // it('should return "fizzbuzz" if the number is divisible by both 3 and 5', () => {
  //   expect(fizzbuzz(15)).toBe('fizzbuzz');
  //   expect(fizzbuzz(30)).toBe('fizzbuzz');
  //   expect(fizzbuzz(45)).toBe('fizzbuzz');
  // });
  //
  // it('should handle edge cases', () => {
  //   expect(fizzbuzz(0)).toBe('fizzbuzz'); // 0は3と5の両方で割り切れる
  //   expect(() => fizzbuzz(-1)).toThrow(); // 負の数の場合はエラーをスローする想定
  // });
});
