package com.entity;

import java.util.Date;
import java.util.List;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.Transient;

import org.hibernate.annotations.NotFound;
import org.hibernate.annotations.NotFoundAction;

@Entity // 注解为hibernate实体
@Table(name="indent") // 注解对应的表名
public class Indent {

    @Id	// 注解主键
    @GeneratedValue //id生成策略  默认auto 相当于hibernate的native - 自增字段
    private int id;
    private float total;
    private int amount;
    private int status;
    private int paytype;
    private Date systime;
    @ManyToOne()
    @NotFound(action=NotFoundAction.IGNORE)
    private Users user;
    @OneToMany
    @Transient // 不持久化
    private List<Items> itemList;


    public int getId() {
        return id;
    }
    public void setId(int id) {
        this.id = id;
    }
    public Users getUser() {
        return user;
    }
    public void setUser(Users user) {
        this.user = user;
    }
    public float getTotal() {
        return total;
    }
    public void setTotal(float total) {
        this.total = (float)Math.round(total*100)/100;
    }
    public Date getSystime() {
        return systime;
    }
    public void setSystime(Date systime) {
        this.systime = systime;
    }
    public List<Items> getItemList() {
        return itemList;
    }
    public void setItemList(List<Items> itemList) {
        this.itemList = itemList;
    }
    public int getAmount() {
        return amount;
    }
    public void setAmount(int amount) {
        this.amount = amount;
    }
    public int getStatus() {
        return status;
    }
    public void setStatus(int status) {
        this.status = status;
    }
    public int getPaytype() {
        return paytype;
    }
    public void setPaytype(int paytype) {
        this.paytype = paytype;
    }

}
