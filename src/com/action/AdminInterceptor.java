package com.action;

import java.util.Objects;

import javax.servlet.http.HttpServletRequest;

import org.apache.struts2.ServletActionContext;

import com.opensymphony.xwork2.ActionInvocation;
import com.opensymphony.xwork2.interceptor.AbstractInterceptor;

/**
 * 后台登录验证拦截器
 */
@SuppressWarnings("serial")
public class AdminInterceptor extends AbstractInterceptor{

    @Override
    public String intercept(ActionInvocation invocation) throws Exception {
        HttpServletRequest request = ServletActionContext.getRequest();
        String uri = request.getRequestURI();
        // 访问非登录请求时拦截
        if(Objects.nonNull(uri) && !uri.contains("login") && !uri.contains("logout")) {
            Object admin = request.getSession().getAttribute("admin");
            if(Objects.isNull(admin)) {
                request.setAttribute("msg", "登录失效");
                return "login";
            }
        }
        return invocation.invoke();
    }

}
