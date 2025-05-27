import { useState } from "react";
import { Button, Form, Input, message, Checkbox } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import styles from "./index.module.less";
import { AuthChangeEventDetail } from "../../types/events";

interface LoginFormValues {
  username: string;
  password: string;
  remember?: boolean;
}

/**
 * 登录页面组件
 * 提供用户登录功能，账号密码验证通过后跳转到大屏页面
 */
const Login = () => {
  const [loading, setLoading] = useState(false);

  /**
   * 触发自定义登录状态变更事件
   * @param isLoggedIn 登录状态
   */
  const triggerAuthChangeEvent = (isLoggedIn: boolean) => {
    // 创建并触发自定义事件
    const authChangeEvent = new CustomEvent("authChange", {
      detail: { isLoggedIn } as AuthChangeEventDetail,
    });
    window.dispatchEvent(authChangeEvent);
  };

  /**
   * 处理登录表单提交
   * @param values 表单值，包含用户名和密码
   */
  const handleLogin = (values: LoginFormValues) => {
    setLoading(true);

    // 账号密码写死，不需要调用接口
    const validUsername = "admin";
    const validPassword = "XI9m)z^B7'ETVam";

    // 模拟登录请求延迟
    setTimeout(() => {
      if (
        values.username === validUsername &&
        values.password === validPassword
      ) {
        // 登录成功，存储登录状态
        localStorage.setItem("isLoggedIn", "true");

        // 触发自定义登录事件
        triggerAuthChangeEvent(true);

        message.success("登录成功");
      } else {
        // 登录失败
        message.error("用户名或密码错误");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className={styles.loginContainer}>
      {/* 左侧装饰元素 */}
      <div className={styles.leftDecoration}>
        {/* 几何图形装饰 */}
        {/* <div className={styles.decorCircle1}></div>
        <div className={styles.decorCircle2}></div>
        <div className={styles.decorCircle3}></div>
        <div className={styles.decorLine1}></div>
        <div className={styles.decorLine2}></div> */}

        {/* 简约科技感文字 */}
        <div className={styles.techText}>
          {/* <div className={styles.techTitle}>民情全息感知与数智治理平台</div> */}
          {/* <div className={styles.techSubtitle}>民情全息感知与数智治理平台</div> */}
        </div>
      </div>

      {/* 登录框 */}
      <div className={styles.loginPanel}>
        <div className={styles.panelHeader}>
          <h1 className={styles.mainTitle}>
            "苏州工业园区“智汇民意”民情分析平台
          </h1>
          <h2 className={styles.subTitle}>欢迎登录系统！</h2>
        </div>

        <div className={styles.loginForm}>
          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={handleLogin}
            size="large"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: "请输入用户名" }]}
            >
              <Input
                placeholder="请输入用户名"
                prefix={<UserOutlined className={styles.inputIcon} />}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "请输入密码" }]}
            >
              <Input.Password
                placeholder="请输入密码"
                prefix={<LockOutlined className={styles.inputIcon} />}
                suffix={<span className={styles.inputStatus}></span>}
              />
            </Form.Item>

            <div className={styles.loginOptions}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox className={styles.rememberPassword}>
                  记住密码
                </Checkbox>
              </Form.Item>
              {/* <a className={styles.forgotPassword} href="#">
                忘记密码?
              </a> */}
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className={styles.loginButton}
              >
                登 录
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>

      {/* 页脚 */}
      <div className={styles.loginFooter}>
        {/* <p>© 2024 智能科技管理系统 | 技术支持</p> */}
      </div>
    </div>
  );
};

export default Login;
