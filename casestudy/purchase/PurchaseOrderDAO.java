package com.info5059.casestudy.purchase;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import com.info5059.casestudy.product.Product;
import com.info5059.casestudy.product.ProductRepository;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.time.LocalDateTime;

@Component
public class PurchaseOrderDAO {

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private ProductRepository prodRepo;

    @Transactional
    public PurchaseOrder create(PurchaseOrder porep) {
        PurchaseOrder realPurchase = new PurchaseOrder();

        realPurchase.setPodate(LocalDateTime.now());
        realPurchase.setVendorid(porep.getVendorid());
        realPurchase.setAmount(porep.getAmount());
        entityManager.persist(realPurchase);
        for (PurchaseOrderLineitem item : porep.getItems()) {
            PurchaseOrderLineitem realPurchaseItem = new PurchaseOrderLineitem();
            realPurchaseItem.setPoid(realPurchase.getId());
            realPurchaseItem.setProductid(item.getProductid());
            realPurchaseItem.setQty(item.getQty());
            realPurchaseItem.setPrice(item.getPrice());
            entityManager.persist(realPurchaseItem);
            Product prod = prodRepo.getReferenceById(item.getProductid());
            prod.setQoo(prod.getQoo() + item.getQty());
            prodRepo.saveAndFlush(prod);
        }
        entityManager.refresh(realPurchase);
        return realPurchase;
    }
}
