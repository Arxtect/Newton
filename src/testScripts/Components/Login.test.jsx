import React from 'react';
import renderer from 'react-test-renderer';
import resetPasswordPage from '@/views/resetPasswordPage';
import LoginPage from '@/views/login';
import { add, subtract } from '@/testScripts/__testComponent__/example.mjs';

test('add', () => {
  expect(add(1, 2)).toBe(3);
});

test('PasswordPage Snapshot', () => {
  const component = renderer.create(<resetPasswordPage />);
  const resetPassword = component.toJSON();
  expect(resetPassword).toMatchSnapshot();
});

test('Match Snapshot', () => {
  const component = renderer.create(<LoginPage />);
  const login = component.toJSON();
  expect(login).toMatchSnapshot();
});


// import { render, screen, fireEvent } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
// import LoginPage from '@/views/login';

// describe('Login Component', () => {
//   // 基本渲染测试
//   test('renders login form', () => {
//     render(<LoginPage />);
    
//     expect(screen.getByTestId('email-input')).toBeInTheDocument();
//     expect(screen.getByTestId('password-input')).toBeInTheDocument();
//   });

//   // 用户交互测试
//   test('handles user input', async () => {
//     render(<LoginPage />);
    
//     // 获取元素
//     const emailInput = screen.getByTestId('email-input');
//     const passwordInput = screen.getByTestId('password-input');
//     const submitButton = screen.getByTestId('login-button');

//     // 模拟用户输入
//     await userEvent.type(emailInput, 'inside_test1@google.com');
//     await userEvent.type(passwordInput, 'inside_test1@google.com');
    
//     // 模拟点击
//     await userEvent.click(submitButton);

//     // 验证结果
//     expect(emailInput.value).toBe('inside_test1@google.com');
//   });

//   // 错误处理测试
//   test('displays error message', async () => {
//     render(<LoginPage />);
    
//     const submitButton = screen.getByTestId('login-button');
//     await userEvent.click(submitButton);

//     expect(screen.getByText('Email is required')).toBeInTheDocument();
//   });
// }); 

