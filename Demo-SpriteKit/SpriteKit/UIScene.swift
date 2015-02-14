//
//  UIScene.swift
//  Demo-SpriteKit
//
//  Created by Fuda Ryusuke on 2015/02/11.
//  Copyright (c) 2015年 Ryusuke Fuda. All rights reserved.
//

import SpriteKit

class UIScene: SKScene {
    
    private var centerX = UIScreen.mainScreen().bounds.width/2
    private var centerY = UIScreen.mainScreen().bounds.height/2
    var filters = CIFilter(name: "CIGaussianBlur")
    let effectsNode = SKEffectNode()
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
    }
    
    override func didMoveToView(view: SKView) {
        /* Setup your scene here */
        
    }
    
    override func touchesBegan(touches: NSSet, withEvent event: UIEvent) {
        /* Called when a touch begins */
        
        for touch: AnyObject in touches {
            let location = touch.locationInNode(self)
            
        }
    }
    
    override func update(currentTime: CFTimeInterval) {
        /* Called before each frame is rendered */
    }
    
    
    func fireScaleSpark(name:String, location:CGPoint, scale:CGFloat){
        let path = NSBundle.mainBundle().pathForResource(name, ofType: "sks")
        var sceneData = NSData(contentsOfFile: path!, options: .DataReadingMappedIfSafe, error: nil)!
        let particle = NSKeyedUnarchiver.unarchiveObjectWithFile(path!) as SKEmitterNode
        particle.position = location
        self.addChild(particle)
        let scale = SKAction.scaleTo(scale, duration: 0.2)
        let fadeout = SKAction.fadeOutWithDuration(0.2)
        let remove = SKAction.removeFromParent()
        let sequence = SKAction.sequence([scale,fadeout,remove])
        particle.runAction(sequence)
    }
    
    func infoAlert(point:CGPoint, delay:Double, callBack:() -> Void) {
        let path = NSBundle.mainBundle().pathForResource("BlackSmoke", ofType: "sks")
        var sceneData = NSData(contentsOfFile: path!, options: .DataReadingMappedIfSafe, error: nil)!
        let particle = NSKeyedUnarchiver.unarchiveObjectWithFile(path!) as SKEmitterNode
        particle.position = point
        self.addChild(particle)
        
        let scale = SKAction.scaleTo(10.0, duration: 1.0)
        let fadeout = SKAction.fadeOutWithDuration(0.5)
        let remove = SKAction.removeFromParent()
        let sequence = SKAction.sequence([scale,fadeout,remove])
        particle.runAction(sequence)
        let delayCount = delay * Double(NSEC_PER_SEC)
        let time = dispatch_time(DISPATCH_TIME_NOW, Int64(delayCount))
        dispatch_after(time, dispatch_get_main_queue(), {
            callBack()
        })
    }

    func doneAlert(type:String, posi:CGPoint, delay:Double, callback: () -> Void){
        
        let path = NSBundle.mainBundle().pathForResource(type, ofType: "sks")
        var sceneData = NSData(contentsOfFile: path!, options: .DataReadingMappedIfSafe, error: nil)!
        let particle = NSKeyedUnarchiver.unarchiveObjectWithFile(path!) as SKEmitterNode
        particle.position = posi
        self.addChild(particle)
        
        let scale = SKAction.scaleTo(20.0, duration: 0.2)
        let transY = SKAction.moveToY(CGFloat(350), duration: 0.5)
        let fadeout = SKAction.fadeOutWithDuration(0.2)
        let remove = SKAction.removeFromParent()
        let sequence = SKAction.sequence([transY,scale,fadeout,remove])
        particle.runAction(sequence)
        
        let delay = delay * Double(NSEC_PER_SEC)
        let time  = dispatch_time(DISPATCH_TIME_NOW, Int64(delay))
        dispatch_after(time, dispatch_get_main_queue(), {
            callback()
        })
    }
    
    func tapCircle(point:CGPoint) {
        let path = NSBundle.mainBundle().pathForResource("GreyBokeh", ofType: "sks")
        var sceneData = NSData(contentsOfFile: path!, options: .DataReadingMappedIfSafe, error: nil)!
        let particle = NSKeyedUnarchiver.unarchiveObjectWithFile(path!) as SKEmitterNode
        particle.position = point
        self.addChild(particle)
        
        let scale = SKAction.scaleTo(2.0, duration: 1.0)
        let fadeout = SKAction.fadeOutWithDuration(0.5)
        let remove = SKAction.removeFromParent()
        let sequence = SKAction.sequence([scale,fadeout,remove])
        particle.runAction(sequence)
    }
    
    func fireHeart(point:CGPoint) {
        let path = NSBundle.mainBundle().pathForResource("heartSpark", ofType: "sks")
        let sceneData = NSData(contentsOfFile: path!, options: .DataReadingMappedIfSafe, error: nil)!
        let particle = NSKeyedUnarchiver.unarchiveObjectWithFile(path!) as SKEmitterNode
        particle.position = point
        
        
        let scale = SKAction.scaleTo(1.0, duration: 1.0)
        let fadeout = SKAction.fadeOutWithDuration(0.5)
        let remove = SKAction.removeFromParent()
        let sequence = SKAction.sequence([scale, fadeout,remove])
        particle.runAction(sequence)
        
        self.addChild(particle)
    }

    func manga() {
        let path = NSBundle.mainBundle().pathForResource("Manga_01", ofType: "sks")
        var sceneData = NSData(contentsOfFile: path!, options: .DataReadingMappedIfSafe, error: nil)!
        let particle = NSKeyedUnarchiver.unarchiveObjectWithFile(path!) as SKEmitterNode
        particle.position = CGPointMake(centerX, 200)
        self.addChild(particle)

        let scale = SKAction.scaleTo(1.0, duration: 1.0)
        let fadeout = SKAction.fadeOutWithDuration(0.5)
        let remove = SKAction.removeFromParent()
        let sequence = SKAction.sequence([scale, fadeout,remove])
        particle.runAction(sequence)

    }
    
    func blur() {

        filters.setValue(0, forKey: kCIInputRadiusKey)
        
        effectsNode.filter = filters
        effectsNode.position = self.view!.center
        effectsNode.blendMode = .Alpha
        
        
        let texture = SKTexture(imageNamed: "bg")
        let sprite = SKSpriteNode(texture: texture)
        sprite.position = CGPointMake(0, -10)
        sprite.size = CGSizeMake(260, 480)
       
        effectsNode.addChild(sprite)
       
        self.addChild(effectsNode)
        
        let slider = UISlider()
        slider.minimumValue = 0;
        slider.maximumValue = 20;
        slider.center = CGPointMake(200, 620);
        slider.addTarget(self, action: "changeBlur:", forControlEvents: UIControlEvents.TouchUpInside)
        self.view?.addSubview(slider)
        
    }
    
    func changeBlur(sender:UISlider) {
        filters.setValue(sender.value, forKey: kCIInputRadiusKey)
        effectsNode.filter = filters
    }

    

}
