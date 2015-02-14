//
//  MainViewController.swift
//  Demo-SpriteKit
//
//  Created by Fuda Ryusuke on 2015/02/11.
//  Copyright (c) 2015年 Ryusuke Fuda. All rights reserved.
//

import UIKit

class MainViewController: UIViewController, UITableViewDelegate, UITableViewDataSource {

    let titleArr = ["Button", "Alert", "Gesture", "Manga", "Blur"]
    
    override func viewDidLoad() {
        super.viewDidLoad()
   
    }
    
    func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return titleArr.count
    }
    
    func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        let cell = UITableViewCell(style: UITableViewCellStyle.Default, reuseIdentifier: "Cell")
        cell.textLabel?.text = titleArr[indexPath.row]
        
        return cell
    }
    
    func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
        tableView.deselectRowAtIndexPath(indexPath, animated: true)
        let sb = UIStoryboard(name: "Main", bundle: nil)
        var vc:UIViewController!
        switch indexPath.row {
        case 0:
            vc = sb.instantiateViewControllerWithIdentifier("ButtonViewController") as UIViewController
            break
        case 1:
            vc = sb.instantiateViewControllerWithIdentifier("AlertViewController") as UIViewController
            break
        case 2:
            vc = sb.instantiateViewControllerWithIdentifier("GestureViewController") as UIViewController
            break
        case 3:
            vc = sb.instantiateViewControllerWithIdentifier("MangaViewController") as UIViewController
            break
        case 4:
            vc = sb.instantiateViewControllerWithIdentifier("BlurViewController") as UIViewController
            break
        default:
            break
        }
        self.navigationController?.pushViewController(vc, animated: true)
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
    */

}
